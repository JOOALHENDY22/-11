import React from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  User, 
  LogOut
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { UserRole } from '../../types';
import { rxStore } from '../../store/rxStore';

interface NavbarProps {
  currentView: 'landing' | 'portal';
  onNavigate: (view: 'landing' | 'portal') => void;
  currentRole: UserRole | null;
  onOpenRoleAuth: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentRole,
  onOpenRoleAuth
}) => {
  const currentUser = rxStore.getCurrentUser();

  const getRoleBadge = () => {
    if (!currentRole) return null;
    switch (currentRole) {
      case 'doctor':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-medical-50 text-medical-800 border border-medical-200">
            <Stethoscope className="w-3.5 h-3.5 text-medical-600" />
            <span>بوابة الأطباء</span>
          </span>
        );
      case 'pharmacist':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Pill className="w-3.5 h-3.5 text-blue-600" />
            <span>محطة الصيدلية</span>
          </span>
        );
      case 'patient':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-mint-50 text-mint-800 border border-mint-200">
            <User className="w-3.5 h-3.5 text-mint-600" />
            <span>محفظة المريض</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onNavigate('landing');
                rxStore.setCurrentRole(null);
              }}
              className="flex items-center gap-2.5 group text-right focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-navy-900 to-medical-600 flex items-center justify-center text-white shadow-md shadow-medical-900/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-navy-900 tracking-tight">
                    Safe<span className="text-medical-600">Rx</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-medical-100 text-medical-800">
                    منظومة طبية
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                  الروشتة الرقمية الآمنة
                </p>
              </div>
            </button>

            {/* Top Navigation role shortcuts */}
            <nav className="hidden lg:flex items-center gap-2 pr-4 border-r border-slate-200">
              <button
                onClick={() => onOpenRoleAuth('doctor')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-medical-700 hover:bg-medical-50/60 transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-medical-600" />
                <span>دخول الطبيب</span>
              </button>
              <button
                onClick={() => onOpenRoleAuth('pharmacist')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/60 transition-colors flex items-center gap-1.5"
              >
                <Pill className="w-3.5 h-3.5 text-blue-600" />
                <span>دخول الصيدلي</span>
              </button>
              <button
                onClick={() => onOpenRoleAuth('patient')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-mint-700 hover:bg-mint-50/60 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-mint-600" />
                <span>دخول المريض</span>
              </button>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageToggle />

            {/* Active Portal Badge */}
            {getRoleBadge()}

            {/* User Account or Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-navy-900 leading-tight">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'doctor' ? 'طبيب' : currentUser.role === 'pharmacist' ? 'صيدلي' : 'مريض'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    rxStore.logout();
                    onNavigate('landing');
                  }}
                  title="تسجيل الخروج"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
