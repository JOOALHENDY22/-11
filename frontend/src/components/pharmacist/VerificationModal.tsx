import React from 'react';
import { Modal } from '../common/Modal';
import { Prescription } from '../../types';
import { ShieldCheck, Calendar, Stethoscope, User, QrCode, ArrowRight, Lock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface VerificationModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rx: Prescription) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!prescription) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-navy-900">
          <ShieldCheck className="w-5 h-5 text-medical-600" />
          <span>Verify Prescription Security</span>
        </div>
      }
      subtitle="Confirm identity parameters before unlocking full clinical formulary."
    >
      <div className="space-y-6">
        {/* Security Warning Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            Strict Health Data Privacy: Patient information is locked until matching cryptographic RX Code verification is confirmed.
          </span>
        </div>

        {/* Verification Summary Card (Requirement 18) */}
        <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/90 space-y-4">
          <div className="text-center pb-3 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Prescription Verification Gate
            </span>
            <span className="text-xl font-black font-mono text-navy-900">
              {prescription.rxCode}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Patient Name */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Patient:</span>
              </span>
              <span className="font-bold text-navy-900 text-sm">
                {prescription.patientName}
              </span>
            </div>

            {/* Doctor Name */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>Doctor:</span>
              </span>
              <span className="font-bold text-navy-900">
                {prescription.doctorName}
              </span>
            </div>

            {/* Prescription ID */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Prescription ID:</span>
              </span>
              <span className="font-mono font-bold text-medical-700">
                {prescription.rxCode}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date:</span>
              </span>
              <span className="font-semibold text-slate-800">
                {formatDate(prescription.createdAt)}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-mint-50 text-mint-700 border border-mint-200">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
                <span>{prescription.status === 'dispensed' ? 'Dispensed' : 'Active'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(prescription)}
            className="px-6 py-3 rounded-2xl bg-navy-900 hover:bg-medical-600 text-white font-bold text-xs shadow-md shadow-navy-950/20 transition-all flex items-center gap-2"
          >
            <span>Confirm & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
