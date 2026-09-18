import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { MedicationItem, SafetyAlert } from '../../types';
import { rxStore } from '../../store/rxStore';
import { MOCK_MEDICATION_CATALOG } from '../../data/mockMedications';
import { runClinicalSafetyCheck } from '../../utils/safetyEngine';
import { SafetyAlertBanner } from '../common/SafetyAlertBanner';
import { 
  Plus, 
  Trash2, 
  Search, 
  User, 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Pill,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rxCode: string) => void;
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Patient Details
  const [patientName, setPatientName] = useState<string>('');
  const [patientAgeOrDob, setPatientAgeOrDob] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('male');
  const [patientAllergies, setPatientAllergies] = useState<string>('');
  const [patientConditions, setPatientConditions] = useState<string>('');

  // Clinical Details
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [hr, setHr] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Medications list (Optional fields, doctor can fill what they want)
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: `med-${Date.now()}-1`,
      name: '',
      genericName: '',
      dosage: '',
      form: 'tablet',
      frequency: 'حسب إرشادات الطبيب',
      duration: '7 أيام',
      timing: 'after_meal',
      quantity: 1,
      refillsAllowed: 0,
      specialInstructions: '',
      drugClass: ''
    }
  ]);

  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Re-run safety check
  useEffect(() => {
    const allergiesList = patientAllergies ? patientAllergies.split(',').map(s => s.trim()) : [];
    const conditionsList = patientConditions ? patientConditions.split(',').map(s => s.trim()) : [];
    const validMeds = medications.filter(m => m.name.trim().length > 0);
    const alerts = runClinicalSafetyCheck(validMeds, allergiesList, conditionsList);
    setSafetyAlerts(alerts);
  }, [medications, patientAllergies, patientConditions]);

  const handleAddEmptyMedication = () => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}-${Math.random()}`,
      name: '',
      genericName: '',
      dosage: '',
      form: 'tablet',
      frequency: 'حسب إرشادات الطبيب',
      duration: '7 أيام',
      timing: 'after_meal',
      quantity: 1,
      refillsAllowed: 0,
      specialInstructions: '',
      drugClass: ''
    };
    setMedications([...medications, newMed]);
  };

  const handleAddFromCatalog = (item: typeof MOCK_MEDICATION_CATALOG[0]) => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}-${Math.random()}`,
      name: item.name,
      genericName: item.genericName,
      dosage: item.availableDosages[0] || '',
      form: item.forms[0] || 'tablet',
      frequency: item.defaultFrequency,
      duration: '7 أيام',
      timing: item.defaultTiming,
      quantity: 1,
      refillsAllowed: 0,
      specialInstructions: '',
      drugClass: item.drugClass
    };
    setMedications([...medications, newMed]);
    setCatalogSearch('');
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleUpdateMedication = (index: number, field: keyof MedicationItem, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  // Submit without forcing mandatory fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const allergiesList = patientAllergies ? patientAllergies.split(',').map(s => s.trim()) : [];
    const conditionsList = patientConditions ? patientConditions.split(',').map(s => s.trim()) : [];

    // Filter filled meds, or default to general prescription if empty
    const filledMeds = medications.filter(m => m.name.trim().length > 0);
    const finalMeds: MedicationItem[] = filledMeds.length > 0 ? filledMeds : [
      {
        id: `med-gen-${Date.now()}`,
        name: 'علاج موصوف بالفحص السريري',
        genericName: 'حسب إرشادات الطبيب',
        dosage: 'جرعة قياسية',
        form: 'tablet',
        frequency: 'حسب إرشادات الطبيب',
        duration: 'حسب الحاجة',
        timing: 'anytime',
        quantity: 1,
        refillsAllowed: 0
      }
    ];

    const createdRx = await rxStore.createPrescription({
      patientName: patientName.trim() || 'مريض (بدون اسم)',
      patientNationalId: patientPhone.trim() || 'غير محدد',
      patientDob: patientAgeOrDob.trim() || 'غير محدد',
      patientGender,
      patientAllergies: allergiesList,
      patientConditions: conditionsList,
      diagnosis: diagnosis.trim() || 'كشف عام وفحص سريري',
      clinicalNotes: clinicalNotes.trim(),
      vitals: {
        bloodPressure: bp || undefined,
        heartRate: hr ? Number(hr) : undefined,
        weightKg: weight ? Number(weight) : undefined
      },
      medications: finalMeds
    });

    setIsSaving(false);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    // Reset Form
    setPatientName('');
    setPatientAgeOrDob('');
    setPatientPhone('');
    setPatientAllergies('');
    setPatientConditions('');
    setDiagnosis('');
    setClinicalNotes('');
    setBp('');
    setHr('');
    setWeight('');

    onSuccess(createdRx.rxCode);
  };

  const filteredCatalog = catalogSearch.trim()
    ? MOCK_MEDICATION_CATALOG.filter(m => 
        m.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        m.genericName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="تحرير روشتة طبية (جميع الخانات اختيارية)"
      subtitle="املأ الخانات التي تحتاجها بحرية بدون أي إلزام بحقول إجبارية."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Information */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-medical-600" />
              <h4 className="text-sm font-bold text-navy-900">1. بيانات وهوية المريض</h4>
            </div>
            <span className="text-[11px] text-slate-400">اختياري</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="مثال: يوسف محمد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">السن / تاريخ الميلاد</label>
              <input
                type="text"
                value={patientAgeOrDob}
                onChange={(e) => setPatientAgeOrDob(e.target.value)}
                placeholder="مثال: 32 سنة"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف أو المعرف</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="مثال: 01001234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1">الحساسية المعروفة (إن وجدت)</label>
              <input
                type="text"
                value={patientAllergies}
                onChange={(e) => setPatientAllergies(e.target.value)}
                placeholder="مثال: بنسلين، سلفا"
                className="w-full px-3.5 py-2 rounded-xl bg-rose-50/40 border border-rose-200 text-rose-900 font-semibold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الأمراض المزمنة (إن وجدت)</label>
              <input
                type="text"
                value={patientConditions}
                onChange={(e) => setPatientConditions(e.target.value)}
                placeholder="مثال: ضغط، سكر"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Clinical Evaluation & Diagnosis */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-600" />
              <h4 className="text-sm font-bold text-navy-900">2. الفحص والتشخيص الطبي</h4>
            </div>
            <span className="text-[11px] text-slate-400">اختياري</span>
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">ضغط الدم</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">النبض (HR)</label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="75"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">الوزن (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">التشخيص الطبي</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="مثال: التهاب حلق، فحص دوري، نزلة برد..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-900 focus:ring-2 focus:ring-medical-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الطبيب وتوجيهات الصيدلي</label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="إرشادات إضافية للصيدلي أو المريض..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Add Medications & Dosages */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-medical-600" />
              <h4 className="text-sm font-bold text-navy-900">3. قائمة الأدوية والجرعات</h4>
            </div>
            <span className="text-[11px] text-slate-400">أضف الأدوية بحرية</span>
          </div>

          {/* Quick Formulary Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="بحث سريع في مقترحات الأدوية (أوجمنتين، كونكور، بنادول، إلخ)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500"
            />

            {filteredCatalog.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddFromCatalog(item)}
                    className="w-full p-2.5 hover:bg-medical-50 text-right flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-navy-900">{item.name}</span>
                      <span className="text-[10px] text-slate-500 block">{item.genericName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-medical-50 text-medical-700 font-bold">
                      + إضافة للروشتة
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Medications Form Fields */}
          <div className="space-y-3">
            {medications.map((med, index) => (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-medical-700">
                    الصنف #{index + 1}
                  </span>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف هذا الدواء"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">اسم الدواء</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleUpdateMedication(index, 'name', e.target.value)}
                      placeholder="مثال: Panadol Extra"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">الجرعة / التركيز</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                      placeholder="مثال: 500mg قرص"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">التكرار والمواعيد</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                      placeholder="مثال: 3 مرات يومياً"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">المدة</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedication(index, 'duration', e.target.value)}
                      placeholder="مثال: 5 أيام"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">العلاقة بالطعام</label>
                    <select
                      value={med.timing}
                      onChange={(e) => handleUpdateMedication(index, 'timing', e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                    >
                      <option value="after_meal">بعد الأكل</option>
                      <option value="before_meal">قبل الأكل</option>
                      <option value="with_meal">وسط الوجبة</option>
                      <option value="at_bedtime">قبل النوم</option>
                      <option value="anytime">في أي وقت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">الكمية</label>
                    <input
                      type="number"
                      min={1}
                      value={med.quantity}
                      onChange={(e) => handleUpdateMedication(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">ملاحظة خاصة</label>
                    <input
                      type="text"
                      value={med.specialInstructions || ''}
                      onChange={(e) => handleUpdateMedication(index, 'specialInstructions', e.target.value)}
                      placeholder="عند اللزوم"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddEmptyMedication}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-medical-500 rounded-2xl text-xs font-bold text-slate-700 hover:text-medical-700 transition-colors flex items-center justify-center gap-2 bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دواء آخر للروشتة</span>
            </button>
          </div>
        </div>

        {/* Safety Alerts Banner */}
        <SafetyAlertBanner alerts={safetyAlerts} showNoAlertState={true} />

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs shadow-md shadow-navy-950/20 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ والتوثيق...' : 'حفظ الروشتة وتوليد كود المريض'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
