import React, { useState, useEffect } from 'react';
import { 
  User, 
  QrCode, 
  Pill, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search,
  Sparkles
} from 'lucide-react';
import { rxStore } from '../../store/rxStore';
import { Prescription } from '../../types';
import { DigitalRxCard } from './DigitalRxCard';

export const PatientDashboard: React.FC = () => {
  const [codeInput, setCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedRx, setSearchedRx] = useState<Prescription | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(rxStore.getPatientPrescriptions());

  const currentUser = rxStore.getCurrentUser();

  useEffect(() => {
    const update = () => {
      setPrescriptions([...rxStore.getPatientPrescriptions()]);
    };
    const unsubscribe = rxStore.subscribe(update);
    update();
    return () => unsubscribe();
  }, []);

  const handleSearchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = codeInput.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('يرجى إدخال كود الروشتة الخاص بك (مثال: RX-8841-K92).');
      return;
    }

    setIsSearching(true);
    const found = await rxStore.getPrescriptionByCode(clean);
    setIsSearching(false);

    if (!found) {
      setErrorMessage(`لم يتم العثور على روشتة مطابقة للكود "${clean}". تأكد من الكود المكتوب.`);
      return;
    }

    setSearchedRx(found);
  };

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-mint-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mint-500/20 text-mint-300 text-xs font-semibold border border-mint-500/30">
              <User className="w-4 h-4" />
              <span>محفظة المريض والروشتات الرقمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser?.fullName || 'بوابة المريض'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              استعلم عن روشتتك بكود الطبيب لعرض الأدوية ومواعيد الجرعات وكود الـ QR للصرف من الصيدلية.
            </p>
          </div>
        </div>
      </div>

      {/* Code Search Box for Patient */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>استعلام عن روشتتي</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
            ابحث عن روشتتك الطبية برمز الوصفة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            اكتب كود الروشتة الذي أعطاه لك الطبيب (مثال: RX-8841-K92) لمشاهدة تفاصيل العلاج وكود الـ QR الخاص بك فوراً.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSearchCode} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <QrCode className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="اكتب كود الروشتة هنا (مثال: RX-8841-K92)..."
              className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-slate-200 hover:border-mint-400 focus:border-mint-600 focus:ring-4 focus:ring-mint-500/10 text-sm font-mono font-bold tracking-wider uppercase transition-all text-left"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="py-4 px-8 rounded-2xl bg-navy-900 hover:bg-mint-600 text-white font-extrabold text-sm shadow-md shadow-navy-950/20 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'جارٍ البحث...' : 'عرض روشتتي'}</span>
          </button>
        </form>
      </div>

      {/* Searched Prescription Result Card */}
      {searchedRx && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-mint-600" />
            <h3 className="text-base font-bold text-navy-900">
              نتيجة البحث: روشتة معتمدة
            </h3>
          </div>
          <div className="max-w-3xl">
            <DigitalRxCard prescription={searchedRx} />
          </div>
        </div>
      )}

      {/* All Saved Prescriptions */}
      {prescriptions.length > 0 && !searchedRx && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-navy-900">
            الروشتات المسجلة بحسابك ({prescriptions.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prescriptions.map((rx) => (
              <DigitalRxCard key={rx.id} prescription={rx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
