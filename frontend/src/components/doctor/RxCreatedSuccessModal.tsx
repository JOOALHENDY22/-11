import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Prescription } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  User,
  Pill
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RxCreatedSuccessModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (rx: Prescription) => void;
}

export const RxCreatedSuccessModal: React.FC<RxCreatedSuccessModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onViewDetails
}) => {
  if (!prescription) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(prescription.rxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-mint-700">
          <CheckCircle2 className="w-6 h-6 text-mint-600" />
          <span>تم حفظ الروشتة بنجاح!</span>
        </div>
      }
      subtitle="تم إنشاء الكود المشفر وتوثيق الوصفة في قاعدة البيانات."
    >
      <div className="space-y-6 text-center">
        {/* Patient Code Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-mint-50 to-slate-50 border-2 border-mint-200/90 shadow-sm space-y-4">
          <span className="text-xs font-bold text-mint-800 uppercase tracking-wider block">
            كود الوصفة الخاص بالمريض (Patient Rx Code)
          </span>

          {/* Big Prominent RX Code */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-navy-900 bg-white px-5 py-2.5 rounded-2xl border border-mint-300 shadow-xs selection:bg-mint-200">
              {prescription.rxCode}
            </span>
          </div>

          {/* Copy Code Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-all ${
              copied
                ? 'bg-mint-600 text-white shadow-sm'
                : 'bg-navy-900 hover:bg-medical-600 text-white shadow-sm'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الكود!' : 'نسخ كود المريض'}</span>
          </button>

          {/* QR Code */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <QRCodeSVG
                value={prescription.qrCodeData}
                size={110}
                level="M"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5">
              رمز QR للمسح المباشر في الصيدلية
            </span>
          </div>
        </div>

        {/* Patient and Drugs Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right text-xs space-y-2">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">اسم المريض:</span>
            <span className="font-bold text-navy-900">{prescription.patientName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">التشخيص:</span>
            <span className="font-semibold text-slate-800">{prescription.diagnosis}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">عدد الأدوية الموصوفة:</span>
            <span className="font-bold text-medical-700">{prescription.medications.length} صنف</span>
          </div>
        </div>

        {/* Clinical Instruction Alert */}
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-right text-xs text-blue-900">
          <strong>توجيه الطبيب: </strong>
          أعطِ هذا الكود للمريض أو اطبع له الوصفة. بمجرد أن يقدم المريض الكود للصيدلي، سيتمكن الصيدلي من استعراض الروشتة وصرف العلاج بأمان.
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>طباعة الروشتة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewDetails(prescription);
            }}
            className="py-3 px-4 rounded-xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>استعراض الروشتة كاملة</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
