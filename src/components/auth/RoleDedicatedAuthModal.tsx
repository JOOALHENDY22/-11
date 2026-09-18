import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import { rxStore } from '../../store/rxStore';
import { supabaseService } from '../../services/supabase';
import { 
  Stethoscope, 
  Pill, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Check, 
  AlertCircle,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RoleDedicatedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onSuccess: () => void;
}

export const RoleDedicatedAuthModal: React.FC<RoleDedicatedAuthModalProps> = ({
  isOpen,
  onClose,
  role,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseOrPhone, setLicenseOrPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roleLabels = {
    doctor: {
      title: 'بوابة تسجيل دخول الأطباء',
      badge: 'طبيب معتمد',
      icon: <Stethoscope className="w-5 h-5 text-medical-600" />,
      licenseLabel: 'رقم ترخيص مزاولة المهنة (اختياري)',
      placeholderName: 'د. أحمد حسن',
      color: 'medical'
    },
    pharmacist: {
      title: 'بوابة تسجيل دخول الصيادلة',
      badge: 'صيدلي مرخص',
      icon: <Pill className="w-5 h-5 text-blue-600" />,
      licenseLabel: 'اسم ورقم ترخيص الصيدلية',
      placeholderName: 'صيدلي عمر علي',
      color: 'blue'
    },
    patient: {
      title: 'بوابة تسجيل دخول المرضى',
      badge: 'المريض',
      icon: <UserIcon className="w-5 h-5 text-mint-600" />,
      licenseLabel: 'رقم الهاتف / الرقم القومي',
      placeholderName: 'يوسف محمد',
      color: 'mint'
    }
  };

  const currentRoleInfo = roleLabels[role];

  // Handle Google OAuth Sign In
  const handleGoogleSignInClick = async () => {
    // If real external Supabase URL is provided, redirect to OAuth
    if (supabaseService.hasCustomRealSupabase()) {
      setIsLoading(true);
      await supabaseService.signInWithGoogle(role);
      setIsLoading(false);
      return;
    }

    // Open clean Google Account prompt
    setIsGooglePromptOpen(true);
  };

  const handleConfirmGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim() || `${role}@gmail.com`;
    const cleanName = googleName.trim() || cleanEmail.split('@')[0];

    rxStore.loginWithRole({
      email: cleanEmail,
      fullName: role === 'doctor' && !cleanName.startsWith('د.') ? `د. ${cleanName}` : cleanName,
      role
    });

    setStatusMessage({ text: `تم تسجيل الدخول بحساب Google: (${cleanEmail})`, type: 'success' });
    setIsGooglePromptOpen(false);

    setTimeout(() => {
      onSuccess();
      onClose();
    }, 400);
  };

  // Handle Email / Password Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'يرجى إدخال البريد الإلكتروني.', type: 'error' });
      return;
    }

    const name = fullName || email.split('@')[0];
    rxStore.loginWithRole({
      email,
      fullName: role === 'doctor' && !name.startsWith('د.') ? `د. ${name}` : name,
      role,
      phone: licenseOrPhone
    });

    setStatusMessage({
      text: mode === 'login' ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء الحساب وحفظه بنجاح!',
      type: 'success'
    });

    setTimeout(() => {
      onSuccess();
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-navy-900">
          {currentRoleInfo.icon}
          <span>{currentRoleInfo.title}</span>
        </div>
      }
      subtitle={
        mode === 'login'
          ? 'سجل دخولك بحسابك للمتابعة إلى مساحة عملك الخاصة.'
          : 'أنشئ حساباً جديداً للانضمام للمنظومة الصحية الرقمية.'
      }
    >
      <div className="space-y-5 text-right">
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-mint-50 text-mint-900 border border-mint-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-mint-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Google Account Selector Dialog */}
        {isGooglePromptOpen ? (
          <form onSubmit={handleConfirmGoogleLogin} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h4 className="text-xs font-bold text-navy-900">تسجيل الدخول بحساب Google / Gmail</h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بريدك الإلكتروني (Gmail)
              </label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder={currentRoleInfo.placeholderName}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGooglePromptOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>متابعة والدخول</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </form>
        ) : (
          /* 1-Click Google Login Button */
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>تسجيل الدخول المباشر بحساب Gmail / Google</span>
          </button>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">أو بالبريد الإلكتروني</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم بالكامل *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={currentRoleInfo.placeholderName}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البريد الإلكتروني *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@health.org"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كلمة المرور *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {currentRoleInfo.licenseLabel}
              </label>
              <input
                type="text"
                value={licenseOrPhone}
                onChange={(e) => setLicenseOrPhone(e.target.value)}
                placeholder="مثال: DOC-12345 أو 0100..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs shadow-md shadow-navy-950/20 transition-all"
          >
            {mode === 'login' ? `دخول إلى ${currentRoleInfo.title}` : 'إتمام التسجيل والدخول فوراً'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'login' ? (
            <p>
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-medical-600 font-bold hover:underline mr-1"
              >
                أنشئ حساباً جديداً
              </button>
            </p>
          ) : (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-medical-600 font-bold hover:underline mr-1"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
