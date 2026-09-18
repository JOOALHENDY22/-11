import React from 'react';
import { Stethoscope, Pill, User as UserIcon, RotateCcw, Shield } from 'lucide-react';
import { rxStore } from '../../store/rxStore';
import { UserRole } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface DemoRoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const DemoRoleSwitcher: React.FC<DemoRoleSwitcherProps> = ({
  currentRole,
  onRoleChange
}) => {
  const { t } = useLanguage();

  const handleSwitch = (role: UserRole) => {
    rxStore.switchRole(role);
    onRoleChange(role);
  };

  const handleReset = () => {
    if (window.confirm(t.resetDemo + '?')) {
      rxStore.resetToDemoData();
      onRoleChange('doctor');
    }
  };

  return (
    <div className="bg-navy-900 text-white border-b border-navy-800 px-4 py-2 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-medical-500/20 text-medical-300 font-semibold text-[11px] border border-medical-500/30">
            <Shield className="w-3 h-3 text-medical-400" />
            <span>{t.sandboxTitle}</span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            {t.sandboxDesc}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Doctor Button */}
          <button
            onClick={() => handleSwitch('doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentRole === 'doctor'
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/50 ring-2 ring-medical-400/40'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-medical-200" />
            <span>{t.doctorName}</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-normal">({t.roleDoctor})</span>
          </button>

          {/* Pharmacist Button */}
          <button
            onClick={() => handleSwitch('pharmacist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentRole === 'pharmacist'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 ring-2 ring-blue-400/40'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-blue-200" />
            <span>{t.pharmacistName}</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-normal">({t.rolePharmacist})</span>
          </button>

          {/* Patient Button */}
          <button
            onClick={() => handleSwitch('patient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentRole === 'patient'
                ? 'bg-mint-600 text-white shadow-md shadow-mint-900/50 ring-2 ring-mint-400/40'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-mint-200" />
            <span>{t.patientName}</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-normal">({t.rolePatient})</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            title={t.resetDemo}
            className="p-1.5 rounded-xl bg-navy-800 text-slate-400 hover:text-rose-300 hover:bg-navy-700 transition-colors ml-1 rtl:ml-0 rtl:mr-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
