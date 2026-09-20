import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Pill, 
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Check,
  Bot
} from 'lucide-react';
import { Prescription } from '../../App';
import { AiSafetyService, AiSafetyReport } from '../../services/aiSafetyService';
import { Language } from '../../utils/translations';

interface AiSafetyVerificationCardProps {
  prescription: Prescription;
  language: Language;
  onAnalysisComplete?: (report: AiSafetyReport) => void;
}

export const AiSafetyVerificationCard: React.FC<AiSafetyVerificationCardProps> = ({
  prescription,
  language,
  onAnalysisComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiSafetyReport | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [analyzedCode, setAnalyzedCode] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await AiSafetyService.analyzePrescription(prescription);
      setReport(res);
      setAnalyzedCode(prescription.rxCode);
      if (onAnalysisComplete) onAnalysisComplete(res);
    } catch (e) {
      console.warn('[AiSafetyVerificationCard analysis]', e);
    } finally {
      setLoading(false);
    }
  };

  // If we haven't analyzed this specific prescription yet, show the smooth trigger banner
  const hasResult = report && analyzedCode === prescription.rxCode;

  if (!hasResult && !loading) {
    return (
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-teal-900/10 via-slate-900/5 to-teal-950/10 dark:from-teal-950/30 dark:via-slate-900/40 dark:to-teal-900/20 border border-teal-500/20 shadow-sm transition-all duration-300 space-y-3.5 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'فحص سلامة الروشتة والتفاعلات الدوائية' : 'Prescription Clinical Safety Check'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">
                  {language === 'ar' ? 'فحص فوري' : 'Live Check'}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar' 
                  ? 'التحقق السريري من التفاعلات بين الأدوية، توافق الجرعات، وتعارض حساسية المريض.' 
                  : 'Clinical screening for Drug-Drug interactions, contraindications and allergies.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runAnalysis}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 hover:shadow-lg hover:shadow-teal-600/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            <span>{language === 'ar' ? 'فحص الروشتة للتأكد من سلامتها' : 'Check Prescription Safety'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-800/60 border border-teal-500/30 text-start space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'جارٍ فحص الروشتة للتأكد من سلامتها وتوافق الأدوية...' : 'Checking prescription safety and compatibility...'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ar' ? 'مطابقة الأدوية الموصوفة مع قواعد التفاعلات وموانع الاستعمال الدوائية.' : 'Screening pharmacology database and patient medical records.'}
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full animate-progress" style={{ width: '85%' }}></div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isCritical = report.status === 'critical';
  const isCaution = report.status === 'caution';

  const cardBorder = isCritical
    ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20'
    : isCaution
    ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20'
    : 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20';

  const badgeBg = isCritical
    ? 'bg-rose-600 text-white'
    : isCaution
    ? 'bg-amber-600 text-white'
    : 'bg-emerald-600 text-white';

  return (
    <div className={`rounded-3xl border ${cardBorder} p-5 sm:p-6 space-y-4 transition-all duration-300 text-start shadow-sm`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-rose-500/15 text-rose-600' : isCaution ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-500/15 text-emerald-600'
          }`}>
            {isCritical ? <AlertTriangle className="w-5 h-5" /> : isCaution ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {language === 'ar' ? 'نتيجة فحص سلامة الروشتة والتفاعلات الدوائية' : 'Prescription Safety & Interaction Report'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeBg}`}>
                {report.statusLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {language === 'ar' ? 'تم فحص التفاعلات وتوافق الجرعات وموانع الاستعمال الدوائية' : 'Screened for drug interactions and contraindications'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title={language === 'ar' ? 'إعادة الفحص بالذكاء الاصطناعي' : 'Re-run AI Analysis'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>{language === 'ar' ? 'إعادة الفحص' : 'Re-check'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary Text */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
        {report.summary}
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* 1. Drug-Drug Interactions */}
          {report.drugInteractions && report.drugInteractions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ar' ? `التداخلات الدوائية المرصودة (${report.drugInteractions.length})` : `Detected Drug-Drug Interactions (${report.drugInteractions.length})`}</span>
              </span>
              <div className="space-y-2">
                {report.drugInteractions.map((inter, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      inter.severity === 'major' 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span className="font-mono text-sm">{inter.drugs.join(' ⚡ ')}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        inter.severity === 'major' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {inter.severity === 'major' ? (language === 'ar' ? 'تفاعل شديد' : 'Major') : (language === 'ar' ? 'تفاعل متوسط' : 'Moderate')}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-normal opacity-90">{inter.effect}</p>
                    {inter.clinicalAction && (
                      <div className="pt-1 flex items-start gap-1.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300">
                        <span className="underline">{language === 'ar' ? 'الإجراء المقترح:' : 'Action:'}</span>
                        <span>{inter.clinicalAction}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Allergy Alerts */}
          {report.allergyAlerts && report.allergyAlerts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تحذير حساسية المريض' : 'Patient Allergy Warnings'}</span>
              </span>
              <div className="space-y-2">
                {report.allergyAlerts.map((al, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-950 dark:text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span>{al.drug}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-700 text-white font-mono">
                        {language === 'ar' ? `حساسية تجاه: ${al.allergen}` : `Allergic to: ${al.allergen}`}
                      </span>
                    </div>
                    <p className="text-[11px] font-normal leading-relaxed">{al.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Pharmacist Clinical Advice */}
          {report.pharmacistRecommendations && report.pharmacistRecommendations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'ar' ? 'توصيات الصيدلي الإكلينيكي وتوجيهات الاستخدام' : 'Clinical Pharmacist Recommendations'}</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 ps-4 list-disc marker:text-teal-600">
                {report.pharmacistRecommendations.map((rec, i) => (
                  <li key={i} className="leading-relaxed font-normal">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
