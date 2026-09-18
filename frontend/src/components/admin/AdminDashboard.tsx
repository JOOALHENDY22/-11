import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Activity,
  FileText,
  Lock,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  Pill,
  Stethoscope,
  User,
  Check,
  ArrowRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { AuthService, StoredUserAccount, UserRole, UserStatus, UserSession } from '../../services/authService';
import { Language, translations } from '../../utils/translations';
import { SupabaseClient } from '@supabase/supabase-js';

interface AdminDashboardProps {
  currentUser: UserSession | null;
  onAdminLogin: (user: UserSession) => void;
  onAdminLogout: () => void;
  onExitAdmin: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  totalPrescriptionsCount: number;
  supabaseClient?: SupabaseClient | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onAdminLogin,
  onAdminLogout,
  onExitAdmin,
  isDarkMode,
  onToggleTheme,
  language,
  onToggleLanguage,
  totalPrescriptionsCount,
  supabaseClient
}) => {
  const t = translations[language];

  // Auth State (for admin login form if not logged in as admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // User Management State
  const [users, setUsers] = useState<StoredUserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'doctor' | 'pharmacist' | 'patient'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Load all users
  const refreshUsers = () => {
    const list = AuthService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    refreshUsers();
  }, [currentUser]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const result = await AuthService.login(adminEmail, adminPassword, 'admin', supabaseClient);
    if (result.success && result.user) {
      if (result.user.role !== 'admin') {
        setAuthError(language === 'ar' ? 'هذا الحساب ليس لديه صلاحيات الإدارة.' : 'This account does not have Admin privileges.');
      } else {
        onAdminLogin(result.user);
        refreshUsers();
      }
    } else {
      setAuthError(result.error || (language === 'ar' ? 'فشل تسجيل دخول المسؤول' : 'Admin Login Failed'));
    }

    setAuthLoading(false);
  };

  // Admin Actions
  const handleApprove = (email: string, role: UserRole) => {
    const roleName = role === 'doctor' ? (language === 'ar' ? 'الطبيب' : 'Doctor') : (language === 'ar' ? 'الصيدلي' : 'Pharmacist');
    if (AuthService.approveUser(email, supabaseClient)) {
      refreshUsers();
      showNotification(language === 'ar' ? `تم اعتماد وتفعيل حساب ${roleName} (${email}) بنجاح! ✅` : `Account ${email} approved successfully! ✅`);
    }
  };

  const handleSuspend = (email: string) => {
    if (email === 'jooalhendy@gmail.com') {
      alert(language === 'ar' ? 'لا يمكن إيقاف حساب المشرف العام الرئيسي.' : 'Cannot suspend primary SuperAdmin account.');
      return;
    }
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من إيقاف حساب (${email})؟ لن يتمكن من الدخول للمنظومة.` : `Are you sure you want to suspend account (${email})?`)) {
      if (AuthService.suspendUser(email, supabaseClient)) {
        refreshUsers();
        showNotification(language === 'ar' ? `تم إيقاف حساب (${email}) فورياً. ⛔` : `Account (${email}) suspended immediately. ⛔`);
      }
    }
  };

  const handleUnsuspend = (email: string) => {
    if (AuthService.unsuspendUser(email, supabaseClient)) {
      refreshUsers();
      showNotification(language === 'ar' ? `تم إلغاء إيقاف الحساب (${email}) وإعادة تفعيله. 🔄` : `Account (${email}) reactivated successfully. 🔄`);
    }
  };

  const handleDelete = (email: string) => {
    if (email === 'jooalhendy@gmail.com') {
      alert(language === 'ar' ? 'لا يمكن حذف حساب المشرف العام الرئيسي.' : 'Cannot delete primary SuperAdmin account.');
      return;
    }
    if (window.confirm(language === 'ar' ? `⚠️ تحذير: هل أنت متأكد من حذف الحساب (${email}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.` : `⚠️ Warning: Permanently delete account (${email})?`)) {
      if (AuthService.deleteUser(email, supabaseClient)) {
        refreshUsers();
        showNotification(language === 'ar' ? `تم حذف الحساب (${email}) نهائياً من المنظومة.` : `Account (${email}) deleted.`);
      }
    }
  };

  // Calculate KPIs
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeDoctors = users.filter(u => u.role === 'doctor' && u.status === 'approved');
  const activePharmacies = users.filter(u => u.role === 'pharmacist' && u.status === 'approved');
  const activePatients = users.filter(u => u.role === 'patient');
  const suspendedUsers = users.filter(u => u.status === 'suspended');

  // Filter & Search users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return u.status === 'pending';
    if (statusFilter === 'approved') return u.status === 'approved';
    if (statusFilter === 'suspended') return u.status === 'suspended';
    if (statusFilter === 'doctor') return u.role === 'doctor';
    if (statusFilter === 'pharmacist') return u.role === 'pharmacist';
    if (statusFilter === 'patient') return u.role === 'patient';
    return true;
  });

  // If not logged in as Admin, show Admin Login Screen
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className={`min-h-screen font-sans flex flex-col justify-between ${isDarkMode ? 'dark bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#090d16]/90 border-slate-800/80 shadow-sm' : 'bg-white/90 border-slate-200/80 shadow-xs'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    yo<span className="text-teal-600 dark:text-teal-400">Rosheta</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    {language === 'ar' ? 'بوابة الإدارة المركزية' : 'Admin Security Portal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onExitAdmin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ar' ? 'الرجوع للموقع الرئيسي' : 'Back to Main Site'}</span>
              </button>

              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                onClick={onToggleLanguage}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
              >
                {language === 'ar' ? '🇬🇧 English' : '🇪🇬 عربي'}
              </button>
            </div>
          </div>
        </header>

        {/* Admin Login Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {language === 'ar' ? 'تسجيل دخول المشرف' : 'SuperAdmin Login'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {language === 'ar'
                  ? 'منطقة محمية لإدارة المستخدمين واعتماد تراخيص الأطباء والصيادلة'
                  : 'Restricted area to approve doctors, pharmacists, and manage accounts'}
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in font-normal">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-start">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'بريد المسؤول' : 'Admin Email'}
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => { setAdminEmail(e.target.value); if (authError) setAuthError(''); }}
                  placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني...' : 'Enter admin email...'}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'كلمة المرور المشفرة' : 'Secure Password'}
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); if (authError) setAuthError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{language === 'ar' ? 'دخول لوحة الإدارة' : 'Access Admin Console'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Admin Authenticated Dashboard
  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* Admin Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#090d16]/90 border-slate-800/80 shadow-sm' : 'bg-white/90 border-slate-200/80 shadow-xs'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  yo<span className="text-rose-600 dark:text-rose-400">Admin</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate">
                  {language === 'ar' ? 'الإدارة المركزية' : 'Admin Console'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal -mt-0.5 hidden md:block">
                {language === 'ar' ? 'التحكم الكامل في المستخدمين، وتراخيص الأطباء والصيادلة' : 'Full access to user accounts, approvals, and suspension'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-2.5 py-1 rounded-2xl shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div className="text-start hidden md:block">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate max-w-[120px]">
                  {currentUser?.fullName || 'SuperAdmin'}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {language === 'ar' ? 'أدمن ✓' : 'Admin ✓'}
              </span>
            </div>

            <button
              onClick={onExitAdmin}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-800"
              title={language === 'ar' ? 'الرجوع للموقع' : 'Return to Site'}
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              <span className="hidden md:inline">{language === 'ar' ? 'الرجوع للموقع' : 'Main Site'}</span>
            </button>

            <button
              onClick={onAdminLogout}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
              title={t.logoutTooltip}
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title={isDarkMode ? t.toggleLight : t.toggleDark}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
        {/* Success / Action Notification */}
        {actionSuccessMsg && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-slide-up shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs sm:text-sm truncate">{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg('')} className="p-1 text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Pending Approvals Card (Highlighted) */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${pendingUsers.length > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200' : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${pendingUsers.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
              {pendingUsers.length > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                  {language === 'ar' ? 'مطلوب إجراء' : 'Action'}
                </span>
              )}
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {pendingUsers.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'بانتظار الاعتماد' : 'Pending Approvals'}
            </span>
          </div>

          {/* Active Doctors */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mb-2" />
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {activeDoctors.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'أطباء معتمدون' : 'Verified Doctors'}
            </span>
          </div>

          {/* Active Pharmacies */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mb-2" />
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {activePharmacies.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'صيدليات معتمدة' : 'Verified Pharmacies'}
            </span>
          </div>

          {/* Patients */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mb-2" />
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {activePatients.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'المرضى المسجلون' : 'Registered Patients'}
            </span>
          </div>

          {/* Suspended Accounts */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 mb-2" />
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {suspendedUsers.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'حسابات موقوفة' : 'Suspended Users'}
            </span>
          </div>

          {/* Total Prescriptions */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mb-2" />
            <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">
              {totalPrescriptionsCount}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'ar' ? 'إجمالي الروشتات' : 'Total Prescriptions'}
            </span>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                <span>{language === 'ar' ? 'سجل المستخدمين والتراخيص' : 'User Accounts & Licensing'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar' ? 'إدارة واعتماد الأطباء والصيادلة وإيقاف الحسابات المخالفة' : 'Manage and approve doctor/pharmacist accounts'}
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'ar' ? `الكل (${users.length})` : `All (${users.length})`}
                </button>

                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <span>{language === 'ar' ? `بانتظار الاعتماد` : `Pending`}</span>
                  {pendingUsers.length > 0 && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-600 text-white text-[9px] sm:text-[10px] flex items-center justify-center font-bold">
                      {pendingUsers.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setStatusFilter('doctor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === 'doctor'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'ar' ? `الأطباء` : `Doctors`}
                </button>

                <button
                  onClick={() => setStatusFilter('pharmacist')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === 'pharmacist'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'ar' ? `الصيادلة` : `Pharmacists`}
                </button>

                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === 'suspended'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'ar' ? `الموقوفين (${suspendedUsers.length})` : `Suspended (${suspendedUsers.length})`}
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                  className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Desktop & Tablet Table (Hidden on small mobile phones) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 text-start font-semibold">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3.5 px-4 text-start font-semibold">{language === 'ar' ? 'الدور والصفة' : 'Role'}</th>
                  <th className="py-3.5 px-4 text-start font-semibold">{language === 'ar' ? 'الحالة والاعتماد' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-start font-semibold">{language === 'ar' ? 'تاريخ التسجيل' : 'Registered'}</th>
                  <th className="py-3.5 px-4 text-center font-semibold">{language === 'ar' ? 'الإجراءات والتحكم' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-normal">
                      {language === 'ar' ? 'لا يوجد مستخدمين مطابقين لمعايير البحث' : 'No users match the search criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuperAdmin = u.role === 'admin';
                    return (
                      <tr key={u.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-rose-600'
                                : u.role === 'doctor'
                                ? 'bg-teal-600'
                                : u.role === 'pharmacist'
                                ? 'bg-emerald-600'
                                : 'bg-slate-600'
                            }`}>
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                                {u.fullName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                              : u.role === 'doctor'
                              ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                              : u.role === 'pharmacist'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                          }`}>
                            {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                            {u.role === 'doctor' && <Stethoscope className="w-3.5 h-3.5" />}
                            {u.role === 'pharmacist' && <Pill className="w-3.5 h-3.5" />}
                            {u.role === 'patient' && <User className="w-3.5 h-3.5" />}
                            <span>
                              {u.role === 'admin' && (language === 'ar' ? 'مشرف المنظومة' : 'SuperAdmin')}
                              {u.role === 'doctor' && (language === 'ar' ? 'طبيب بشري' : 'Physician')}
                              {u.role === 'pharmacist' && (language === 'ar' ? 'صيدلي معتمد' : 'Pharmacist')}
                              {u.role === 'patient' && (language === 'ar' ? 'مريض / مستفيد' : 'Patient')}
                            </span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 animate-pulse'
                              : u.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30'
                          }`}>
                            {u.status === 'pending' && <Clock className="w-3 h-3" />}
                            {u.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                            {u.status === 'suspended' && <UserX className="w-3 h-3" />}
                            <span>
                              {u.status === 'pending' && (language === 'ar' ? 'قيد المراجعة والاعتماد' : 'Pending Approval')}
                              {u.status === 'approved' && (language === 'ar' ? 'معتمد ونشط ✓' : 'Active & Approved')}
                              {u.status === 'suspended' && (language === 'ar' ? 'موقوف مؤقتاً ⛔' : 'Suspended')}
                            </span>
                          </span>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          {isSuperAdmin ? (
                            <span className="text-[11px] text-slate-400 italic">
                              {language === 'ar' ? 'حساب محمي' : 'Protected'}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              {/* If Pending: Show Approve Button */}
                              {u.status === 'pending' && (
                                <button
                                  onClick={() => handleApprove(u.email, u.role)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                                  title={language === 'ar' ? 'اعتماد وتفعيل الحساب' : 'Approve Account'}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{language === 'ar' ? 'اعتماد الحساب' : 'Approve'}</span>
                                </button>
                              )}

                              {/* If Approved: Show Suspend Button */}
                              {u.status === 'approved' && (
                                <button
                                  onClick={() => handleSuspend(u.email)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-all"
                                  title={language === 'ar' ? 'إيقاف الحساب مؤقتاً' : 'Suspend Account'}
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>{language === 'ar' ? 'إيقاف' : 'Suspend'}</span>
                                </button>
                              )}

                              {/* If Suspended: Show Reactivate Button */}
                              {u.status === 'suspended' && (
                                <button
                                  onClick={() => handleUnsuspend(u.email)}
                                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                                  title={language === 'ar' ? 'إلغاء الإيقاف وإعادة التفعيل' : 'Reactivate Account'}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{language === 'ar' ? 'إلغاء الإيقاف' : 'Reactivate'}</span>
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(u.email)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title={language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (Visible on Mobile Phones) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {language === 'ar' ? 'لا يوجد مستخدمين مطابقين للبحث' : 'No users match the search criteria'}
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSuperAdmin = u.role === 'admin';
                return (
                  <div key={u.email} className="p-3.5 space-y-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                          u.role === 'admin' ? 'bg-rose-600' : u.role === 'doctor' ? 'bg-teal-600' : u.role === 'pharmacist' ? 'bg-emerald-600' : 'bg-slate-600'
                        }`}>
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block leading-tight truncate">
                            {u.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                        u.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 animate-pulse'
                          : u.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30'
                      }`}>
                        {u.status === 'pending' && (language === 'ar' ? 'بانتظار الاعتماد' : 'Pending')}
                        {u.status === 'approved' && (language === 'ar' ? 'معتمد ✓' : 'Approved ✓')}
                        {u.status === 'suspended' && (language === 'ar' ? 'موقوف ⛔' : 'Suspended ⛔')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                          : u.role === 'doctor'
                          ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                          : u.role === 'pharmacist'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                      }`}>
                        {u.role === 'admin' && (language === 'ar' ? 'مشرف المنظومة' : 'SuperAdmin')}
                        {u.role === 'doctor' && (language === 'ar' ? 'طبيب معالج' : 'Doctor')}
                        {u.role === 'pharmacist' && (language === 'ar' ? 'صيدلي معتمد' : 'Pharmacist')}
                        {u.role === 'patient' && (language === 'ar' ? 'مريض' : 'Patient')}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    {!isSuperAdmin && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(u.email, u.role)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'اعتماد الحساب' : 'Approve'}</span>
                          </button>
                        )}
                        {u.status === 'approved' && (
                          <button
                            onClick={() => handleSuspend(u.email)}
                            className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'إيقاف الحساب' : 'Suspend'}</span>
                          </button>
                        )}
                        {u.status === 'suspended' && (
                          <button
                            onClick={() => handleUnsuspend(u.email)}
                            className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'إلغاء الإيقاف' : 'Reactivate'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u.email)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700"
                          title={language === 'ar' ? 'حذف نهائي' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
