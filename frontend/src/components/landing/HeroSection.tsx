import React from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  User, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  QrCode, 
  Activity, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeroSectionProps {
  onSelectRole: (role: UserRole) => void;
  onOpenAuth: (mode: 'login' | 'register', defaultRole?: UserRole) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectRole,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden pt-6 pb-20 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-medical-100/50 via-blue-50/30 to-mint-50/40 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-50 border border-medical-200/80 shadow-sm text-xs font-semibold text-medical-800 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-medical-500 animate-pulse" />
            <span>{t.heroBadge}</span>
            <span className="text-slate-300">|</span>
            <span className="text-navy-900 font-bold">{t.heroBadgeCds}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
            {t.heroTitle1} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 via-blue-600 to-navy-900">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Quick Metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-mint-500 shrink-0" />
              <span>{t.metric1}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-medical-600 shrink-0" />
              <span>{t.metric2}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-navy-700 shrink-0" />
              <span>{t.metric3}</span>
            </div>
          </div>
        </div>

        {/* Visual Workflow Pipeline */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.workflowTitle}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Doctor */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
              <div className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold text-sm mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-medical-600 uppercase tracking-wider">
                1 • {t.roleDoctor}
              </div>
              <h3 className="text-base font-bold text-navy-900 mt-1">{t.step1Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t.step1Desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>CDS Guard</span>
                <span className="text-mint-600 font-bold">{t.step1Badge}</span>
              </div>
            </div>

            {/* Step 2: Patient */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
              <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center font-bold text-sm mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-mint-600 uppercase tracking-wider">
                2 • {t.rolePatient}
              </div>
              <h3 className="text-base font-bold text-navy-900 mt-1">{t.step2Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t.step2Desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Format</span>
                <span className="font-mono text-medical-700 font-bold">RX-8841-K92</span>
              </div>
            </div>

            {/* Step 3: Pharmacist */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                3 • {t.rolePharmacist}
              </div>
              <h3 className="text-base font-bold text-navy-900 mt-1">{t.step3Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t.step3Desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Access</span>
                <span className="text-navy-900 font-bold">{t.step3Badge}</span>
              </div>
            </div>

            {/* Step 4: Dispensing */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                4 • {t.rolePharmacist}
              </div>
              <h3 className="text-base font-bold text-navy-900 mt-1">{t.step4Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t.step4Desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Audit</span>
                <span className="text-emerald-700 font-bold">{t.step4Badge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Main Role Entrance Cards */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
              {t.roleCardsTitle}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t.roleCardsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Doctor */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-medical-50 border border-medical-100 text-medical-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
                  {t.roleDoctor}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-3">
                  {t.imDoctor}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {t.doctorRoleDesc}
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.doctorFeat1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.doctorFeat2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.doctorFeat3}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectRole('doctor')}
                className="w-full py-3.5 px-5 rounded-2xl bg-navy-900 text-white hover:bg-medical-600 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-navy-950/20 transition-all group-hover:shadow-medical-600/30"
              >
                <span>{t.enterDoctor}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 2: Pharmacist */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Pill className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  {t.rolePharmacist}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-3">
                  {t.imPharmacist}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {t.pharmacistRoleDesc}
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.pharmacistFeat1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.pharmacistFeat2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.pharmacistFeat3}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectRole('pharmacist')}
                className="w-full py-3.5 px-5 rounded-2xl bg-medical-600 text-white hover:bg-medical-700 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-medical-600/20 transition-all group-hover:shadow-medical-600/30"
              >
                <span>{t.enterPharmacist}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 3: Patient */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-mint-50 border border-mint-100 text-mint-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-mint-600 uppercase tracking-wider mb-1">
                  {t.rolePatient}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-3">
                  {t.imPatient}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {t.patientRoleDesc}
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.patientFeat1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.patientFeat2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
                    <span>{t.patientFeat3}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectRole('patient')}
                className="w-full py-3.5 px-5 rounded-2xl bg-navy-900 text-white hover:bg-mint-600 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-navy-950/20 transition-all group-hover:shadow-mint-600/30"
              >
                <span>{t.enterPatient}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
