import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  QrCode, 
  Search, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Building,
  User,
  Stethoscope,
  Calendar,
  Sparkles
} from 'lucide-react';
import { rxStore } from '../../store/rxStore';
import { Prescription } from '../../types';
import { formatDate, formatDateTime, getStatusDetails } from '../../utils/formatters';
import { VerificationModal } from './VerificationModal';
import { DispenseReviewModal } from './DispenseReviewModal';
import { RequestClarificationModal } from './RequestClarificationModal';

export const PharmacistDashboard: React.FC = () => {
  const [rxCodeInput, setRxCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(rxStore.getPrescriptions());

  // Modal Flows
  const [verifyingRx, setVerifyingRx] = useState<Prescription | null>(null);
  const [reviewingRx, setReviewingRx] = useState<Prescription | null>(null);
  const [clarifyingRx, setClarifyingRx] = useState<Prescription | null>(null);

  const currentUser = rxStore.getCurrentUser();

  useEffect(() => {
    const update = () => {
      setPrescriptions([...rxStore.getPrescriptions()]);
    };
    const unsubscribe = rxStore.subscribe(update);
    update();
    return () => unsubscribe();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = rxCodeInput.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('يرجى كتابة كود الروشتة الخاص بالمريض (مثال: RX-XXXX-XXX).');
      return;
    }

    setIsSearching(true);
    const found = await rxStore.getPrescriptionByCode(clean);
    setIsSearching(false);

    if (!found) {
      setErrorMessage(`لم يتم العثور على أي روشتة مطابقة للكود "${clean}". تأكد من صحة الكود من المريض.`);
      return;
    }

    // Open Step 1 Strict Verification Screen
    setVerifyingRx(found);
  };

  const handleConfirmVerification = (rx: Prescription) => {
    setVerifyingRx(null);
    setReviewingRx(rx);
  };

  const handleDispenseSuccess = () => {
    setReviewingRx(null);
    setRxCodeInput('');
    setPrescriptions([...rxStore.getPrescriptions()]);
  };

  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed');

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-blue-950 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Pill className="w-4 h-4" />
              <span>محطة الصيدلي والتحقق من الوصفات وصرف الأدوية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser?.fullName || 'الصيدلي المسؤول'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              ابحث بكود المريض لاستعراض الروشتة التي حررها الطبيب وصرف الأدوية بأمان مع التحقق التلقائي.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10 text-center sm:text-right">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-medium block">الروشتات المصروفة بالصيدلية</span>
            <span className="text-2xl font-black text-mint-400 mt-1 block">{dispensedPrescriptions.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-medium block">أمان البيانات والخصوصية</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">مشفرة برمز RX 🔒</span>
          </div>
        </div>
      </div>

      {/* Primary Action: Patient Code Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>البحث الفوري عن روشتة المريض</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
            استعلام وصرف روشتة طبية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            اطلب من المريض كود الوصفة (RX Code) أو امسح كود الـ QR من هاتفه ليتم جلب الروشتة المعتمدة من الطبيب فوراً من قاعدة البيانات.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Code Input Bar */}
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <QrCode className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={rxCodeInput}
              onChange={(e) => {
                setRxCodeInput(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="اكتب كود المريض هنا (مثال: RX-8841-K92)..."
              className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-sm font-mono font-bold tracking-wider uppercase transition-all text-left"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="py-4 px-8 rounded-2xl bg-navy-900 hover:bg-blue-600 text-white font-extrabold text-sm shadow-md shadow-navy-950/20 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSearching ? 'جارٍ البحث...' : 'بحث وعرض الروشتة'}</span>
          </button>
        </form>
      </div>

      {/* Dispensed History in this Pharmacy */}
      {dispensedPrescriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-mint-600" />
            <h3 className="text-base font-bold text-navy-900">
              سجل الروشتات التي تم صرفها
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dispensedPrescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-navy-900 text-xs">{rx.rxCode}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-mint-50 text-mint-700 font-bold border border-mint-200">
                    تم الصرف ✓
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>المريض: </strong>{rx.patientName}</p>
                  <p><strong>الطبيب: </strong>{rx.doctorName}</p>
                  <p className="text-slate-500"><strong>التشخيص: </strong>{rx.diagnosis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <VerificationModal
        prescription={verifyingRx}
        isOpen={!!verifyingRx}
        onClose={() => setVerifyingRx(null)}
        onConfirm={handleConfirmVerification}
      />

      <DispenseReviewModal
        prescription={reviewingRx}
        isOpen={!!reviewingRx}
        onClose={() => setReviewingRx(null)}
        onRequestClarification={(rx) => {
          setReviewingRx(null);
          setClarifyingRx(rx);
        }}
        onDispenseSuccess={handleDispenseSuccess}
      />

      <RequestClarificationModal
        prescription={clarifyingRx}
        isOpen={!!clarifyingRx}
        onClose={() => setClarifyingRx(null)}
        onSuccess={() => {
          setPrescriptions([...rxStore.getPrescriptions()]);
        }}
      />
    </div>
  );
};
