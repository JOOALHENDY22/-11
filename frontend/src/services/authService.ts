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
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          status: initialStatus,
          password_hash: passwordHash,
          salt: salt,
          created_at: new Date().toISOString()
        }, { onConflict: 'email' });

        if (upsertErr) {
          console.warn('[Supabase Profile Upsert Error]', upsertErr);
        }

        // Record registration in security audit logs
        try {
          await supabase.from('security_audit_logs').insert({
            action: 'USER_REGISTERED',
            performed_by: cleanEmail,
            target_email: cleanEmail,
            target_role: role,
            details: { status: initialStatus, fullName: cleanName }
          });
        } catch {}

        try {
          supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: { data: { full_name: cleanName, role: role, status: initialStatus } }
          });
        } catch {}
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
    const isSuperAdmin = cleanEmail === SUPERADMIN_EMAIL;

    if (localUser || isSuperAdmin) {
      const userSalt = localUser?.salt || cleanEmail;
      const expectedHash = localUser?.passwordHash || (isSuperAdmin ? SUPERADMIN_HASH : '');
      const computedHash = await hashPassword(cleanPass, userSalt);
      const isPasswordValid = computedHash === expectedHash || (isSuperAdmin && (computedHash === SUPERADMIN_HASH || cleanPass === 'YOUSSEF482007'));

      if (isPasswordValid) {
        // If SuperAdmin or Admin account, allow seamless direct access to ANY requested portal for testing!
        const isAdminUser = isSuperAdmin || localUser?.role === 'admin';
        const activeRole: UserRole = isAdminUser ? role : localUser.role;

        // Strict Role-Based Access Control (RBAC) for standard user accounts
        if (!isAdminUser && role !== 'admin' && localUser.role !== role) {
          const roleArabic = localUser.role === 'doctor' ? 'طبيب' : localUser.role === 'pharmacist' ? 'صيدلي' : 'مريض';
          const portalArabic = role === 'doctor' ? 'بوابة الطبيب' : role === 'pharmacist' ? 'محطة الصيدلي' : 'محفظة المريض';
          return {
            success: false,
            error: `هذا الحساب مسجل بدور (${roleArabic}). لا يمكن تسجيل الدخول به من هنا. يرجى التوجه إلى (${portalArabic}) أو إنشاء حساب جديد بالدور المطلوب.`
          };
        }

        // Check Account Status (Pending / Suspended / Approved) - Admins are always approved
        if (!isAdminUser && localUser.status === 'pending') {
          return {
            success: false,
            error: '⏳ حسابك قيد مراجعة واعتماد الإدارة الطبية. ستتمكن من تسجيل الدخول فور الموافقة عليه وتأكيد بيانات الترخيص.'
          };
        }

        if (!isAdminUser && localUser.status === 'suspended') {
          return {
            success: false,
            error: '⛔ تم إيقاف هذا الحساب مؤقتاً من قِبل إدارة المنظومة. يرجى مراجعة إدارة yoRosheta.'
          };
        }

        SecurityRateLimiter.reset(`login_${cleanEmail}`);

        let displayName = localUser?.fullName || 'يوسف الهندي';
        if (isSuperAdmin) {
          if (role === 'doctor') displayName = 'د. يوسف الهندي (طبيب معالج)';
          else if (role === 'pharmacist') displayName = 'د. يوسف الهندي (صيدلي مسؤول)';
          else if (role === 'patient') displayName = 'يوسف الهندي (مريض)';
          else displayName = 'مدير المنظومة (يوسف الهندي)';
        }

        const session: UserSession = {
          email: cleanEmail,
          fullName: displayName,
          role: activeRole
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
          const isSuperAdminAccount = cleanEmail === SUPERADMIN_EMAIL || profile.role === 'admin';
          const activeRole: UserRole = isSuperAdminAccount ? role : ((profile.role as UserRole) || role);

          if (!isSuperAdminAccount && role !== 'admin' && profile.role && profile.role !== role) {
            const roleArabic = profile.role === 'doctor' ? 'طبيب' : profile.role === 'pharmacist' ? 'صيدلي' : 'مريض';
            const portalArabic = role === 'doctor' ? 'بوابة الطبيب' : role === 'pharmacist' ? 'محطة الصيدلي' : 'محفظة المريض';
            return {
              success: false,
              error: `هذا الحساب مسجل بدور (${roleArabic}). لا يمكن تسجيل الدخول به من هنا. يرجى التوجه إلى (${portalArabic}) أو إنشاء حساب جديد بالدور المطلوب.`
            };
          }

          const userStatus: UserStatus = profile.status || (profile.role === 'patient' ? 'approved' : 'pending');

          if (!isSuperAdminAccount && userStatus === 'pending') {
            return {
              success: false,
              error: '⏳ حسابك قيد مراجعة واعتماد الإدارة الطبية. ستتمكن من تسجيل الدخول فور الموافقة عليه وتأكيد بيانات الترخيص.'
            };
          }

          if (!isSuperAdminAccount && userStatus === 'suspended') {
            return {
              success: false,
              error: '⛔ تم إيقاف هذا الحساب مؤقتاً من قِبل إدارة المنظومة. يرجى مراجعة إدارة yoRosheta.'
            };
          }

          const salt = cleanEmail;
          const passwordHash = await hashPassword(cleanPass, salt);
          vault[cleanEmail] = {
            fullName: profile.full_name,
            email: cleanEmail,
            role: (profile.role as UserRole) || activeRole,
            status: userStatus,
            passwordHash,
            salt,
            createdAt: new Date().toISOString()
          };
          this.saveUsersVault(vault);

          let displayName = profile.full_name;
          if (isSuperAdminAccount) {
            if (role === 'doctor') displayName = 'د. يوسف الهندي (طبيب معالج)';
            else if (role === 'pharmacist') displayName = 'د. يوسف الهندي (صيدلي مسؤول)';
            else if (role === 'patient') displayName = 'يوسف الهندي (مريض)';
          }

          const session: UserSession = {
            email: cleanEmail,
            fullName: displayName,
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
   * Synchronize & fetch all registered users from Supabase and local vault.
   */
  public static async fetchAllUsers(supabase?: SupabaseClient | null): Promise<StoredUserAccount[]> {
    const vault = this.getUsersVault();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          data.forEach((p: any) => {
            const email = (p.email || '').trim().toLowerCase();
            if (!email) return;

            const existing = vault[email];
            vault[email] = {
              fullName: p.full_name || existing?.fullName || email,
              email: email,
              role: (p.role as UserRole) || existing?.role || 'patient',
              status: (p.status as UserStatus) || existing?.status || (p.role === 'patient' ? 'approved' : 'pending'),
              passwordHash: p.password_hash || existing?.passwordHash || '',
              salt: p.salt || existing?.salt || email,
              createdAt: p.created_at || existing?.createdAt || new Date().toISOString(),
              approvedAt: p.approved_at || existing?.approvedAt,
              suspendedAt: p.suspended_at || existing?.suspendedAt
            };
          });

          this.saveUsersVault(vault);
        }
      } catch (err) {
        console.warn('[AuthService fetchAllUsers Supabase Error]', err);
      }
    }

    return Object.values(vault).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get cached registered users from local vault synchronously.
   */
  public static getAllUsers(): StoredUserAccount[] {
    const vault = this.getUsersVault();
    return Object.values(vault).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Approve a pending doctor or pharmacist account.
   */
  public static async approveUser(email: string, supabase?: SupabaseClient | null): Promise<boolean> {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (!vault[cleanEmail]) {
      vault[cleanEmail] = {
        fullName: cleanEmail,
        email: cleanEmail,
        role: 'doctor',
        status: 'approved',
        passwordHash: '',
        salt: cleanEmail,
        createdAt: nowIso
      };
    }

    vault[cleanEmail].status = 'approved';
    vault[cleanEmail].approvedAt = nowIso;
    this.saveUsersVault(vault);

    if (supabase) {
      try {
        await supabase.from('profiles').update({
          status: 'approved',
          approved_at: nowIso,
          approved_by: 'SuperAdmin'
        }).ilike('email', cleanEmail);

        try {
          await supabase.from('security_audit_logs').insert({
            action: 'USER_APPROVED',
            performed_by: 'SuperAdmin',
            target_email: cleanEmail,
            target_role: vault[cleanEmail].role,
            details: { approvedAt: nowIso }
          });
        } catch {}
      } catch (err) {
        console.warn('[Supabase Approve User Error]', err);
      }
    }
    return true;
  }

  /**
   * Suspend/Freeze an active user account.
   */
  public static async suspendUser(email: string, supabase?: SupabaseClient | null): Promise<boolean> {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (cleanEmail === SUPERADMIN_EMAIL) return false;

    if (!vault[cleanEmail]) {
      vault[cleanEmail] = {
        fullName: cleanEmail,
        email: cleanEmail,
        role: 'doctor',
        status: 'suspended',
        passwordHash: '',
        salt: cleanEmail,
        createdAt: nowIso
      };
    }

    vault[cleanEmail].status = 'suspended';
    vault[cleanEmail].suspendedAt = nowIso;
    this.saveUsersVault(vault);

    // If suspended user is currently logged in, clear their session
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.email === cleanEmail) {
      this.setCurrentSession(null);
    }

    if (supabase) {
      try {
        await supabase.from('profiles').update({
          status: 'suspended',
          suspended_at: nowIso,
          suspended_by: 'SuperAdmin'
        }).ilike('email', cleanEmail);

        try {
          await supabase.from('security_audit_logs').insert({
            action: 'USER_SUSPENDED',
            performed_by: 'SuperAdmin',
            target_email: cleanEmail,
            target_role: vault[cleanEmail].role,
            details: { suspendedAt: nowIso }
          });
        } catch {}
      } catch (err) {
        console.warn('[Supabase Suspend User Error]', err);
      }
    }
    return true;
  }

  /**
   * Unsuspend / Reactivate a user account.
   */
  public static async unsuspendUser(email: string, supabase?: SupabaseClient | null): Promise<boolean> {
    return this.approveUser(email, supabase);
  }

  /**
   * Delete a user account from vault and database.
   */
  public static async deleteUser(email: string, supabase?: SupabaseClient | null): Promise<boolean> {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === SUPERADMIN_EMAIL) return false;

    if (vault[cleanEmail]) {
      delete vault[cleanEmail];
      this.saveUsersVault(vault);
    }

    if (supabase) {
      try {
        await supabase.from('profiles').delete().ilike('email', cleanEmail);

        try {
          await supabase.from('security_audit_logs').insert({
            action: 'USER_DELETED',
            performed_by: 'SuperAdmin',
            target_email: cleanEmail,
            details: { deletedAt: new Date().toISOString() }
          });
        } catch {}
      } catch (err) {
        console.warn('[Supabase Delete User Error]', err);
      }
    }
    return true;
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

