import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Prescription } from '../../types';
import { rxStore } from '../../store/rxStore';
import { SafetyAlertBanner } from '../common/SafetyAlertBanner';
import { 
  Pill, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  User, 
  Lock,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DispenseReviewModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestClarification: (rx: Prescription) => void;
  onDispenseSuccess: () => void;
}

export const DispenseReviewModal: React.FC<DispenseReviewModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onRequestClarification,
  onDispenseSuccess
}) => {
  if (!prescription) return null;

  const [batchNumber, setBatchNumber] = useState<string>(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dispenseNotes, setDispenseNotes] = useState<string>('Patient identity verified. Oral counseling provided on dosing schedule.');
  const [safetyChecked, setSafetyChecked] = useState<boolean>(true);
  const [patientCounseled, setPatientCounseled] = useState<boolean>(true);

  const isAlreadyDispensed = prescription.status === 'dispensed';

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber) {
      alert('Please enter a valid batch/lot number.');
      return;
    }

    rxStore.dispensePrescription(prescription.id, {
      batchNumber,
      notes: dispenseNotes
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    onDispenseSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-blue-600" />
          <span>Pharmacy Dispensing & Medication Safety Review</span>
        </div>
      }
      subtitle={`Prescription: ${prescription.rxCode} • Prescribed by ${prescription.doctorName}`}
    >
      <div className="space-y-6">
        {/* Patient Summary Header */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Name</span>
            <span className="font-bold text-navy-900 text-sm">{prescription.patientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">National ID</span>
            <span className="font-mono text-slate-700">{prescription.patientNationalId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Known Allergies</span>
            <span className="font-bold text-rose-700">
              {prescription.patientAllergies.length > 0 ? prescription.patientAllergies.join(', ') : 'None'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Prescribing Doctor</span>
            <span className="font-bold text-navy-900">{prescription.doctorName}</span>
          </div>
        </div>

        {/* Diagnosis & Notes */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-1">
          <span className="font-bold text-blue-900 uppercase tracking-wider block">
            Clinical Diagnosis & Instructions:
          </span>
          <p className="text-slate-800 font-semibold">{prescription.diagnosis}</p>
          {prescription.clinicalNotes && (
            <p className="text-slate-600 italic">Notes: "{prescription.clinicalNotes}"</p>
          )}
        </div>

        {/* Formulary Medications to Dispense */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Medications to Dispense ({prescription.medications.length})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Verify packaging & dosages</span>
          </div>

          <div className="space-y-2.5">
            {prescription.medications.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">{idx + 1}. {item.name}</span>
                    <span className="text-[11px] text-slate-500">{item.genericName} • {item.drugClass}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    Qty: {item.quantity} units
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Dosage:</span>
                    <span className="font-semibold text-slate-800">{item.dosage} ({item.form})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Frequency:</span>
                    <span className="font-semibold text-slate-800">{item.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Timing:</span>
                    <span className="font-semibold text-slate-800 capitalize">{item.timing.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration:</span>
                    <span className="font-semibold text-slate-800">{item.duration}</span>
                  </div>
                </div>

                {item.specialInstructions && (
                  <div className="text-[11px] text-medical-800 bg-medical-50/60 p-2 rounded-lg border border-medical-100">
                    <strong>Counseling Note: </strong> {item.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Banner */}
        <SafetyAlertBanner alerts={prescription.safetyAlerts} showNoAlertState={true} />

        {/* Dispense Form / Completed Info */}
        {isAlreadyDispensed ? (
          <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-mint-800">
              <CheckCircle2 className="w-4 h-4 text-mint-600" />
              <span>Dispensed Record Closed</span>
            </div>
            <p>
              Dispensed on {prescription.dispensedAt} by {prescription.dispensedByPharmacistName} ({prescription.dispensedByPharmacyName}).
            </p>
            <p className="font-mono text-[11px] text-slate-600">
              Batch: {prescription.dispensingBatchNumber} | Notes: {prescription.dispensingNotes}
            </p>
          </div>
        ) : (
          <form onSubmit={handleDispense} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
                Pharmacist Dispensing Sign-off
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lot / Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispensing & Patient Counseling Notes
                  </label>
                  <input
                    type="text"
                    value={dispenseNotes}
                    onChange={(e) => setDispenseNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Safety Checklist Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecked}
                    onChange={(e) => setSafetyChecked(e.target.checked)}
                    className="rounded text-medical-600 focus:ring-medical-500 w-4 h-4"
                  />
                  <span>I have verified medication dosages, expiration dates, and packaging integrity.</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patientCounseled}
                    onChange={(e) => setPatientCounseled(e.target.checked)}
                    className="rounded text-medical-600 focus:ring-medical-500 w-4 h-4"
                  />
                  <span>Patient received personalized verbal counseling regarding timing with meals and side effects.</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onRequestClarification(prescription)}
                className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Request Clarification from Doctor</span>
              </button>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!safetyChecked || !patientCounseled}
                  className="px-6 py-2.5 rounded-xl bg-mint-600 hover:bg-mint-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-mint-950/20 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Safe Dispensing</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
