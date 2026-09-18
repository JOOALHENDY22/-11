import { SupabaseClient } from '@supabase/supabase-js';
import { hashPassword, sanitizeInput, SecurityRateLimiter } from '../utils/security';

export type UserRole = 'admin' | 'doctor' | 'pharmacist' | 'patient';
export type UserStatus = 'pending' | 'approved' | 'suspended';

export interface UserSession {
  email: string;
  fullName: string;
  role: UserRole;
  token?: string;
}

export interface StoredUserAccount {
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  salt: string;
  createdAt: string;
  approvedAt?: string;
  suspendedAt?: string;
}

const STORAGE_USERS_DB_KEY = 'saferx_sec_users_vault_v2';
const STORAGE_CURRENT_SESSION_KEY = 'saferx_sec_active_session_v2';

// Pre-calculated SHA-256 for SuperAdmin: salt "jooalhendy@gmail.com" + pass "YOUSSEF482007"
export const SUPERADMIN_EMAIL = 'jooalhendy@gmail.com';
export const SUPERADMIN_HASH = '56fc9a13fc19bcb03070d475286e31ac74381cab00510f4b5daf451b6f1ae890';

export class AuthService {
  private static getUsersVault(): Record<string, StoredUserAccount> {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_DB_KEY);
      const vault: Record<string, StoredUserAccount> = raw ? JSON.parse(raw) : {};

      // Remove any old demo admin account
      if (vault['admin@yorosheta.com']) {
        delete vault['admin@yorosheta.com'];
      }

      // Seed SuperAdmin if not exists
      if (!vault[SUPERADMIN_EMAIL]) {
        vault[SUPERADMIN_EMAIL] = {
          fullName: 'مدير المنظومة (يوسف الهندي)',
          email: SUPERADMIN_EMAIL,
          role: 'admin',
          status: 'approved',
          passwordHash: SUPERADMIN_HASH,
          salt: SUPERADMIN_EMAIL,
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_USERS_DB_KEY, JSON.stringify(vault));
      } else {
        // Ensure role & hash are strictly up-to-date
        vault[SUPERADMIN_EMAIL].role = 'admin';
        vault[SUPERADMIN_EMAIL].status = 'approved';
        vault[SUPERADMIN_EMAIL].passwordHash = SUPERADMIN_HASH;
        vault[SUPERADMIN_EMAIL].salt = SUPERADMIN_EMAIL;
      }

      // Backward compatibility: ensure every user has a valid status
      let modified = false;
      Object.keys(vault).forEach(email => {
        if (!vault[email].status) {
          vault[email].status = 'approved';
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem(STORAGE_USERS_DB_KEY, JSON.stringify(vault));
      }

      return vault;
    } catch {
      return {};
    }
  }

  private static saveUsersVault(vault: Record<string, StoredUserAccount>): void {
    try {
      localStorage.setItem(STORAGE_USERS_DB_KEY, JSON.stringify(vault));
    } catch (err) {
      console.error('[AuthService Vault Save]', err);
    }
  }

  /**
   * Register a new user with SHA-256 password hashing and salt.
   * Doctors and Pharmacists are created with 'pending' status awaiting admin approval.
   * Patients are created with 'approved' status immediately.
   */
  public static async register(
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    supabase?: SupabaseClient | null
  ): Promise<{ success: boolean; pendingApproval?: boolean; user?: UserSession; message?: string; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = sanitizeInput(name);
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صالح.' };
    }
    if (!cleanName) {
      return { success: false, error: 'يرجى إدخال الاسم الكامل.' };
    }
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'كلمة المرور يجب ألا تقل عن 6 أحرف لحماية حسابك.' };
    }

    const salt = cleanEmail;
    const passwordHash = await hashPassword(cleanPass, salt);

    // Patients are automatically approved; Doctors & Pharmacists require Admin Approval
    const initialStatus: UserStatus = role === 'patient' ? 'approved' : 'pending';

    // Save to local secure vault
    const vault = this.getUsersVault();
    vault[cleanEmail] = {
      fullName: cleanName,
      email: cleanEmail,
      role,
      status: initialStatus,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      ...(initialStatus === 'approved' ? { approvedAt: new Date().toISOString() } : {})
    };
    this.saveUsersVault(vault);

    // Save to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          status: initialStatus
        }, { onConflict: 'email' });

        supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: { data: { full_name: cleanName, role: role, status: initialStatus } }
        }).catch(err => console.warn('[Supabase Auth Background]', err));
      } catch (err) {
        console.warn('[Supabase Profile Upsert]', err);
      }
    }

    if (initialStatus === 'pending') {
      const roleArabic = role === 'doctor' ? 'طبيب' : 'صيدلي';
      return {
        success: true,
        pendingApproval: true,
        message: `تم تسجيل بياناتك بنجاح! حسابك كـ (${roleArabic}) قيد مراجعة واعتماد إدارة yoRosheta لضمان التراخيص الطبية. ستتمكن من تسجيل الدخول فور موافقة المسؤول.`
      };
    }

    const session: UserSession = {
      email: cleanEmail,
      fullName: cleanName,
      role
    };
    this.setCurrentSession(session);

    return { success: true, pendingApproval: false, user: session };
  }

  /**
   * Log in returning user with brute force rate limiting, hash verification, and RBAC status check.
   */
  public static async login(
    email: string,
    pass: string,
    role: UserRole,
    supabase?: SupabaseClient | null
  ): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صالح.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    // Check rate limit for this account (Strict for admin: max 4 attempts / 5 mins)
    const maxAttempts = role === 'admin' ? 4 : 5;
    const windowSeconds = role === 'admin' ? 300 : 120;
    const rateCheck = SecurityRateLimiter.checkLimit(`login_${cleanEmail}`, maxAttempts, windowSeconds);
    if (!rateCheck.allowed) {
      return { 
        success: false, 
        error: `تم قفل محاولات الدخول مؤقتاً لأسباب أمنية. يرجى الانتظار ${rateCheck.remainingSeconds} ثانية قبل إعادة المحاولة.` 
      };
    }

    const vault = this.getUsersVault();
    const localUser = vault[cleanEmail];

    if (localUser) {
      const computedHash = await hashPassword(cleanPass, localUser.salt || cleanEmail);
      if (computedHash === localUser.passwordHash) {
        // Enforce strict Role-Based Access Control (RBAC)
        if (role !== 'admin' && localUser.role !== 'admin' && localUser.role !== role) {
          const roleArabic = localUser.role === 'doctor' ? 'طبيب' : localUser.role === 'pharmacist' ? 'صيدلي' : 'مريض';
          const portalArabic = role === 'doctor' ? 'بوابة الطبيب' : role === 'pharmacist' ? 'محطة الصيدلي' : 'محفظة المريض';
          return {
            success: false,
            error: `هذا الحساب مسجل بدور (${roleArabic}). لا يمكن تسجيل الدخول به من هنا. يرجى التوجه إلى (${portalArabic}) أو إنشاء حساب جديد بالدور المطلوب.`
          };
        }

        // Check Account Status (Pending / Suspended / Approved)
        if (localUser.status === 'pending' && localUser.role !== 'admin') {
          return {
            success: false,
            error: '⏳ حسابك قيد مراجعة واعتماد الإدارة الطبية. ستتمكن من تسجيل الدخول فور الموافقة عليه وتأكيد بيانات الترخيص.'
          };
        }

        if (localUser.status === 'suspended' && localUser.role !== 'admin') {
          return {
            success: false,
            error: '⛔ تم إيقاف هذا الحساب مؤقتاً من قِبل إدارة المنظومة. يرجى مراجعة إدارة yoRosheta.'
          };
        }

        SecurityRateLimiter.reset(`login_${cleanEmail}`);
        const session: UserSession = {
          email: cleanEmail,
          fullName: localUser.fullName,
          role: localUser.role
        };
        this.setCurrentSession(session);
        return { success: true, user: session };
      } else {
        const lockStatus = SecurityRateLimiter.recordFailedAttempt(`login_${cleanEmail}`, 5, 120);
        if (lockStatus.isLockedNow) {
          return {
            success: false,
            error: `تم قفل الحساب مؤقتاً لمدة ${lockStatus.remainingSeconds} ثانية لتكرار إدخال كلمة المرور بشكل خاطئ.`
          };
        }
        return { success: false, error: 'كلمة المرور غير صحيحة. يرجى إعادة المحاولة.' };
      }
    }

    // Check Supabase if not found locally
    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (profile && profile.full_name) {
          if (role !== 'admin' && profile.role && profile.role !== role) {
            const roleArabic = profile.role === 'doctor' ? 'طبيب' : profile.role === 'pharmacist' ? 'صيدلي' : 'مريض';
            const portalArabic = role === 'doctor' ? 'بوابة الطبيب' : role === 'pharmacist' ? 'محطة الصيدلي' : 'محفظة المريض';
            return {
              success: false,
              error: `هذا الحساب مسجل بدور (${roleArabic}). لا يمكن تسجيل الدخول به من هنا. يرجى التوجه إلى (${portalArabic}) أو إنشاء حساب جديد بالدور المطلوب.`
            };
          }

          const userStatus: UserStatus = profile.status || (profile.role === 'patient' ? 'approved' : 'pending');

          if (userStatus === 'pending' && profile.role !== 'admin') {
            return {
              success: false,
              error: '⏳ حسابك قيد مراجعة واعتماد الإدارة الطبية. ستتمكن من تسجيل الدخول فور الموافقة عليه وتأكيد بيانات الترخيص.'
            };
          }

          if (userStatus === 'suspended' && profile.role !== 'admin') {
            return {
              success: false,
              error: '⛔ تم إيقاف هذا الحساب مؤقتاً من قِبل إدارة المنظومة. يرجى مراجعة إدارة yoRosheta.'
            };
          }

          const salt = cleanEmail;
          const passwordHash = await hashPassword(cleanPass, salt);
          const activeRole: UserRole = (profile.role as UserRole) || role;
          vault[cleanEmail] = {
            fullName: profile.full_name,
            email: cleanEmail,
            role: activeRole,
            status: userStatus,
            passwordHash,
            salt,
            createdAt: new Date().toISOString()
          };
          this.saveUsersVault(vault);

          const session: UserSession = {
            email: cleanEmail,
            fullName: profile.full_name,
            role: activeRole
          };
          this.setCurrentSession(session);
          SecurityRateLimiter.reset(`login_${cleanEmail}`);
          return { success: true, user: session };
        }
      } catch (err) {
        console.warn('[Supabase Auth Check]', err);
      }
    }

    return { 
      success: false, 
      error: 'هذا الحساب غير مسجل بعد. اضغط على تبويب "إنشاء حساب جديد" لكتابة اسمك وإنشاء الحساب في ثوانٍ.' 
    };
  }

  // ==========================================
  // ADMIN MANAGEMENT METHODS
  // ==========================================

  /**
   * Get all registered users from vault.
   */
  public static getAllUsers(): StoredUserAccount[] {
    const vault = this.getUsersVault();
    return Object.values(vault).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Approve a pending doctor or pharmacist account.
   */
  public static approveUser(email: string, supabase?: SupabaseClient | null): boolean {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();
    if (vault[cleanEmail]) {
      vault[cleanEmail].status = 'approved';
      vault[cleanEmail].approvedAt = new Date().toISOString();
      this.saveUsersVault(vault);

      if (supabase) {
        supabase.from('profiles').update({ status: 'approved' }).eq('email', cleanEmail).then(() => {}, console.warn);
      }
      return true;
    }
    return false;
  }

  /**
   * Suspend/Freeze an active user account.
   */
  public static suspendUser(email: string, supabase?: SupabaseClient | null): boolean {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();
    if (vault[cleanEmail] && vault[cleanEmail].role !== 'admin') {
      vault[cleanEmail].status = 'suspended';
      vault[cleanEmail].suspendedAt = new Date().toISOString();
      this.saveUsersVault(vault);

      // If suspended user is currently logged in, clear their session
      const currentSession = this.getCurrentSession();
      if (currentSession && currentSession.email === cleanEmail) {
        this.setCurrentSession(null);
      }

      if (supabase) {
        supabase.from('profiles').update({ status: 'suspended' }).eq('email', cleanEmail).then(() => {}, console.warn);
      }
      return true;
    }
    return false;
  }

  /**
   * Unsuspend / Reactivate a user account.
   */
  public static unsuspendUser(email: string, supabase?: SupabaseClient | null): boolean {
    return this.approveUser(email, supabase);
  }

  /**
   * Delete a user account from vault.
   */
  public static deleteUser(email: string, supabase?: SupabaseClient | null): boolean {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();
    if (vault[cleanEmail] && vault[cleanEmail].role !== 'admin') {
      delete vault[cleanEmail];
      this.saveUsersVault(vault);

      if (supabase) {
        supabase.from('profiles').delete().eq('email', cleanEmail).then(() => {}, console.warn);
      }
      return true;
    }
    return false;
  }

  public static getCurrentSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static setCurrentSession(session: UserSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_CURRENT_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_SESSION_KEY);
    }
  }

  public static async logout(supabase?: SupabaseClient | null): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    this.setCurrentSession(null);
  }
}

