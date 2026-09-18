import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  FileText, 
  User, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  QrCode,
  CheckCircle2,
  Copy,
  Calendar,
  Sparkles,
  Database
} from 'lucide-react';
import { rxStore } from '../../store/rxStore';
import { Prescription } from '../../types';
import { formatDate, getStatusDetails } from '../../utils/formatters';
import { CreatePrescriptionModal } from './CreatePrescriptionModal';
import { PrescriptionDetailModal } from './PrescriptionDetailModal';
import { RxCreatedSuccessModal } from './RxCreatedSuccessModal';

export const DoctorDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(rxStore.getDoctorPrescriptions());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [justCreatedRx, setJustCreatedRx] = useState<Prescription | null>(null);

  const currentUser = rxStore.getCurrentUser();

  useEffect(() => {
    const update = () => {
      setPrescriptions([...rxStore.getDoctorPrescriptions()]);
    };
    const unsubscribe = rxStore.subscribe(update);
    update();
    return () => unsubscribe();
  }, []);

  const handlePrescriptionCreated = async (rxCode: string) => {
    setIsCreateOpen(false);
    const newlyCreated = await rxStore.getPrescriptionByCode(rxCode);
    if (newlyCreated) {
      setJustCreatedRx(newlyCreated);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rxCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-medical-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-medical-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-medical-500/20 text-medical-300 text-xs font-semibold border border-medical-500/30">
              <Stethoscope className="w-4 h-4" />
              <span>مساحة عمل الطبيب المعالج والعيادة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser?.fullName || 'د. الطبيب المعالج'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              أضف المرضى وحرر الروشتات الرقمية المشفرة مع فحص التفاعلات الدوائية والحساسية لحظياً.
            </p>
          </div>

          {/* Primary CTA: Add Patient & Create Rx */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-4 rounded-2xl bg-medical-600 hover:bg-medical-500 text-white font-extrabold text-sm shadow-xl shadow-medical-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>➕ إضافة مريض وتحرير روشتة جديدة</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-center sm:text-right">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-medium block">إجمالي الروشتات المحررة</span>
            <span className="text-2xl font-black text-white mt-1 block">{prescriptions.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-medium block">سارية وبانتظار الصرف</span>
            <span className="text-2xl font-black text-medical-400 mt-1 block">
              {prescriptions.filter(p => p.status === 'active' || p.status === 'verified').length}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-medium block">تم صرفها بالصيدلية</span>
            <span className="text-2xl font-black text-mint-400 mt-1 block">
              {prescriptions.filter(p => p.status === 'dispensed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Prescriptions Registry */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-medical-600" />
            <h2 className="text-lg font-bold text-navy-900">
              سجل الروشتات والمرضى
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {filteredPrescriptions.length}
            </span>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المريض أو كود الروشتة..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="active">سارية</option>
              <option value="dispensed">تم الصرف</option>
            </select>
          </div>
        </div>

        {/* Prescription Cards List or Empty State */}
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">لا توجد روشتات مسجلة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                اضغط على زر <strong>"إضافة مريض وتحرير روشتة جديدة"</strong> لإدخال أول مريض وكتابة الأدوية وتوليد كود الروشتة والـ QR.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مريض الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrescriptions.map((rx) => {
              const status = getStatusDetails(rx.status, 'ar');
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-medical-600" />
                        <span className="text-xs font-mono font-bold text-navy-900">
                          {rx.rxCode}
                        </span>
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-sm text-navy-900 group-hover:text-medical-600 transition-colors">
                          {rx.patientName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {rx.diagnosis}
                      </p>
                    </div>

                    {/* Medications Preview */}
                    <div className="mt-3 bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        الأدوية الموصوفة ({rx.medications.length})
                      </span>
                      {rx.medications.slice(0, 2).map((m) => (
                        <div key={m.id} className="text-xs text-slate-700 truncate flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-medical-500 shrink-0" />
                          <span>{m.name}</span>
                          <span className="text-slate-400 font-normal">({m.dosage})</span>
                        </div>
                      ))}
                      {rx.medications.length > 2 && (
                        <span className="text-[10px] text-medical-600 font-semibold block pt-0.5">
                          +{rx.medications.length - 2} أصناف أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{formatDate(rx.createdAt, 'ar')}</span>
                    <span className="text-medical-600 font-bold flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                      <span>عرض وتفاصيل</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePrescriptionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handlePrescriptionCreated}
      />

      <RxCreatedSuccessModal
        prescription={justCreatedRx}
        isOpen={!!justCreatedRx}
        onClose={() => setJustCreatedRx(null)}
        onViewDetails={(rx) => setSelectedRx(rx)}
      />

      <PrescriptionDetailModal
        prescription={selectedRx}
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
      />
    </div>
  );
};
