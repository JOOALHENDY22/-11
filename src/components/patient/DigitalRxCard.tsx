import React from 'react';
import { Prescription } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Stethoscope, 
  Pill, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  Building,
  Sparkles
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusDetails } from '../../utils/formatters';

interface DigitalRxCardProps {
  prescription: Prescription;
  onOpenDetails?: () => void;
}

export const DigitalRxCard: React.FC<DigitalRxCardProps> = ({
  prescription,
  onOpenDetails
}) => {
  const status = getStatusDetails(prescription.status);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all space-y-6 relative overflow-hidden">
      {/* Top Banner with RX Code & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Digital Rx Pass
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-black font-mono text-navy-900">
              {prescription.rxCode}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
              PIN: {prescription.securityPin}
            </span>
          </div>
        </div>

        <span className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${status.bg} ${status.text} ${status.border}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span>{status.label}</span>
        </span>
      </div>

      {/* Main Section: High-Contrast QR Code + Presentation Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <QRCodeSVG
            value={prescription.qrCodeData}
            size={130}
            level="H"
            includeMargin={true}
          />
          <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">
            Present to Pharmacist
          </span>
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-navy-900">
              {prescription.diagnosis}
            </h4>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-medical-600" />
              <span>Prescribed by {prescription.doctorName} • {formatDate(prescription.createdAt)}</span>
            </p>
          </div>

          {/* Step Progression */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-white border border-slate-200 font-semibold text-mint-700">
              <span className="block font-bold">1. Prescribed</span>
              <span className="text-[9px] text-slate-400">Doctor signed</span>
            </div>
            <div className={`p-2 rounded-xl border font-semibold ${
              prescription.status !== 'active' ? 'bg-white border-blue-200 text-blue-700' : 'bg-slate-100/60 border-slate-200 text-slate-400'
            }`}>
              <span className="block font-bold">2. Verified</span>
              <span className="text-[9px] text-slate-400">Pharmacy scanned</span>
            </div>
            <div className={`p-2 rounded-xl border font-semibold ${
              prescription.status === 'dispensed' ? 'bg-mint-50 border-mint-200 text-mint-700' : 'bg-slate-100/60 border-slate-200 text-slate-400'
            }`}>
              <span className="block font-bold">3. Dispensed</span>
              <span className="text-[9px] text-slate-400">{prescription.status === 'dispensed' ? 'Ready' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medications Guide */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
          Prescribed Medications & Patient Schedule ({prescription.medications.length})
        </span>

        <div className="space-y-2.5">
          {prescription.medications.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-navy-900 block">{item.name}</span>
                <span className="text-[11px] text-slate-500">{item.genericName} • {item.dosage}</span>
                {item.specialInstructions && (
                  <span className="text-[10px] text-medical-700 font-medium block">
                    * {item.specialInstructions}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-medical-50 text-medical-800 font-bold text-[11px] border border-medical-100">
                  {item.frequency}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] capitalize">
                  {item.timing.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispensing Completed Notice if dispensed */}
      {prescription.status === 'dispensed' && (
        <div className="p-4 rounded-2xl bg-mint-50/80 border border-mint-200 text-mint-900 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-mint-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Medication Dispensed Successfully</span>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Dispensed by {prescription.dispensedByPharmacistName} at {prescription.dispensedByPharmacyName} on {formatDateTime(prescription.dispensedAt)}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
