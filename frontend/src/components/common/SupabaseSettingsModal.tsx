import React, { useState } from 'react';
import { Modal } from './Modal';
import { supabaseService } from '../../services/supabase';
import { AiSafetyService } from '../../services/aiSafetyService';
import { Database, Check, AlertCircle, ExternalLink, Key, ShieldCheck, Sparkles } from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const currentConfig = supabaseService.getConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [aiApiKey, setAiApiKey] = useState(AiSafetyService.getApiKey());
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiApiKey) {
      AiSafetyService.setApiKey(aiApiKey);
    }

    if (url && anonKey) {
      const isOk = supabaseService.saveConfig(url, anonKey);
      if (!isOk) {
        setStatusMessage({ text: 'تعذر الاتصال، تأكد من صحة الرابط ومفتاح الـ Anon Key.', type: 'error' });
        return;
      }
    }

    setStatusMessage({ text: 'تم حفظ إعدادات قاعدة البيانات ومفتاح الذكاء الاصطناعي بنجاح! 🚀', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2 text-navy-900">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>إعدادات الاتصال بقاعدة بيانات Supabase</span>
        </div>
      }
      subtitle="اربط موقعك مباشرة بمشروعك على Supabase لحفظ كل بيانات تسجيل الدخول والروشتات."
    >
      <form onSubmit={handleSave} className="space-y-4">
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-mint-50 text-mint-900 border border-mint-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-mint-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-900">كيف تحصل على بيانات الربط من Supabase؟</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-medical-600 hover:underline flex items-center gap-1 font-bold"
            >
              <span>فتح لوحة Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="leading-relaxed">
            1. افتح مشروعك في موقع Supabase ➔ ادخل على <strong>Project Settings</strong> ➔ اضغط على <strong>API</strong>.
            <br />
            2. انسخ <strong>Project URL</strong> و <strong>anon / public API Key</strong> وضعهما في الخانات بالأسفل.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Project URL (عنوان المشروع) *
          </label>
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-medical-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Anon Public Key (المفتاح العام) *
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-medical-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-medical-600" />
              مفتاح الذكاء الاصطناعي (AI Safety Check API Key)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">اختياري (مدمج تلقائياً)</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder="sk-apx..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-medical-500 focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">يُستخدم هذا المفتاح للتحقق التلقائي الذكي من التفاعلات الدوائية وموانع الاستعمال في خانة الصيدلي.</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            يتم حفظ المفاتيح محلياً بأمان، وعند الحفظ سيتم توجيه جميع عمليات التسجيل وإضافة الروشتات وفحص التفاعلات الدوائية بالذكاء الاصطناعي تلقائياً.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs shadow-md transition-all"
          >
            حفظ وتفعيل الربط مع Supabase
          </button>
        </div>
      </form>
    </Modal>
  );
};
