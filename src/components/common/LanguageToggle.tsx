import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
      <button
        onClick={() => setLanguage('ar')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'ar'
            ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200/50'
            : 'text-slate-500 hover:text-navy-900'
        }`}
        title="التحويل للغة العربية"
      >
        <span>🇪🇬</span>
        <span>العربية</span>
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200/50'
            : 'text-slate-500 hover:text-navy-900'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};
