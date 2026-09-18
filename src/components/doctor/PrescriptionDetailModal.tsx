import React from 'react';
import { Modal } from '../common/Modal';
import { Prescription, PharmacistRequest, AuditLog } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  Share2, 
  ShieldCheck, 
  Stethoscope, 
  Calendar, 
  User, 
  FileText, 
  Activity, 
  Pill, 
  CheckCircle,
  AlertCircle,
  Lock,
  Clock
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusDetails } from '../../utils/formatters';
import { rxStore } from '../../store/rxStore';
import { SafetyAlertBanner } from '../common/SafetyAlertBanner';

interface PrescriptionDetailModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenClarification?: () => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onOpenClarification
}) => {
  if (!prescription) return null;

  const statusInfo = getStatusDetails(prescription.status);
  const auditLogs = rxStore.getAuditLogs(prescription.id);
  const requests = rxStore.getRequestsForPrescription(prescription.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3">
          <span>Digital Prescription Details</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            {statusInfo.label}
          </span>
        </div>
      }
      subtitle={`Prescription Identifier: ${prescription.rxCode} • Created on ${formatDateTime(prescription.createdAt)}`}
    >
      <div className="space-y-6">
        {/* Printable Prescription Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden" id="prescription-printable-card">
          {/* Watermark/Header Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-navy-900 tracking-tight">
                  {prescription.doctorName}
                </h3>
                <p className="text-xs font-semibold text-medical-600">
                  {prescription.doctorSpecialty}
                </p>
                <p className="text-[11px] text-slate-500">
                  {prescription.clinicName} • Lic: {prescription.doctorLicense}
                </p>
              </div>
            </div>

            {/* QR Code and RX Code in header */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <QRCodeSVG
                  value={prescription.qrCodeData}
                  size={68}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prescription Code
                </span>
                <span className="text-base font-black font-mono text-navy-900 block">
                  {prescription.rxCode}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Security PIN: <span className="font-mono font-bold text-navy-900">{prescription.securityPin}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Patient Health Passport Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Patient Name</span>
              <span className="font-bold text-navy-900 text-sm">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">National ID / DOB</span>
              <span className="font-medium text-slate-700">{prescription.patientNationalId} ({prescription.patientDob})</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Known Allergies</span>
              <span className="font-bold text-rose-700">
                {prescription.patientAllergies.length > 0 ? prescription.patientAllergies.join(', ') : 'None documented'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Date Issued</span>
              <span className="font-medium text-slate-700">{formatDate(prescription.createdAt)}</span>
            </div>
          </div>

          {/* Diagnosis & Vitals */}
          <div className="py-4 border-b border-slate-100 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider shrink-0 mt-0.5">
                Diagnosis:
              </span>
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                {prescription.diagnosis}
              </span>
            </div>

            {prescription.vitals && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                {prescription.vitals.bloodPressure && (
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <strong className="text-navy-900">BP:</strong> {prescription.vitals.bloodPressure} mmHg
                  </span>
                )}
                {prescription.vitals.heartRate && (
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <strong className="text-navy-900">HR:</strong> {prescription.vitals.heartRate} bpm
                  </span>
                )}
                {prescription.vitals.temperature && (
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <strong className="text-navy-900">Temp:</strong> {prescription.vitals.temperature}°C
                  </span>
                )}
                {prescription.vitals.weightKg && (
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <strong className="text-navy-900">Weight:</strong> {prescription.vitals.weightKg} kg
                  </span>
                )}
              </div>
            )}

            {prescription.clinicalNotes && (
              <p className="text-xs text-slate-500 italic pt-1">
                "Clinical Notes: {prescription.clinicalNotes}"
              </p>
            )}
          </div>

          {/* Prescribed Medications Table */}
          <div className="py-4 space-y-3">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-medical-600" />
              <span>Prescribed Medications (Rx Formulary)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Medication Name & Generic</th>
                    <th className="p-3">Dosage / Form</th>
                    <th className="p-3">Frequency & Timing</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Qty / Refill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medications.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-navy-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.genericName}</span>
                        {item.specialInstructions && (
                          <span className="text-[10px] text-medical-700 italic block mt-0.5">
                            * {item.specialInstructions}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {item.dosage} <span className="text-slate-400 capitalize">({item.form})</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block">{item.frequency}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{item.timing.replace('_', ' ')}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{item.duration}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {item.quantity} units ({item.refillsAllowed} refills)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Alerts if any */}
          {prescription.safetyAlerts.length > 0 && (
            <div className="pt-2">
              <SafetyAlertBanner alerts={prescription.safetyAlerts} />
            </div>
          )}

          {/* Dispensing Record Section (if verified or dispensed) */}
          {prescription.status === 'dispensed' && (
            <div className="mt-6 p-4 rounded-2xl bg-mint-50/80 border border-mint-200 text-xs text-mint-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-mint-800">
                <CheckCircle className="w-4 h-4 text-mint-600" />
                <span>Medication Dispensing Verified & Completed</span>
              </div>
              <p className="text-slate-600">
                Dispensed by: <strong className="text-navy-900">{prescription.dispensedByPharmacistName}</strong> at{' '}
                <strong className="text-navy-900">{prescription.dispensedByPharmacyName}</strong> on{' '}
                {formatDateTime(prescription.dispensedAt)}.
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Batch Number: {prescription.dispensingBatchNumber} | Notes: {prescription.dispensingNotes || 'None'}
              </p>
            </div>
          )}
        </div>

        {/* Doctor-Pharmacist Clarifications Thread if any */}
        {requests.length > 0 && (
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center justify-between">
              <span>Doctor-Pharmacist Clarification Channel</span>
              <span className="text-[10px] text-slate-500 font-normal">Direct Clinical Bridge</span>
            </h4>

            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700">
                      Query: {req.requestType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(req.createdAt)}</span>
                  </div>
                  <p className="text-slate-700">
                    <strong className="text-navy-900">{req.pharmacistName} ({req.pharmacyName}): </strong>
                    "{req.message}"
                  </p>

                  {req.doctorResponse ? (
                    <div className="p-3 rounded-xl bg-medical-50 border border-medical-200 text-medical-900 mt-2">
                      <span className="font-bold block text-navy-900">{req.doctorName} (Physician Response):</span>
                      "{req.doctorResponse}"
                    </div>
                  ) : (
                    <div className="text-amber-600 font-semibold text-[11px] pt-1">
                      * Awaiting physician answer.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immutable Audit Trail */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Immutable Audit Trail</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Blockchain/RLS Timestamped</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-navy-900">{log.action.replace(/_/g, ' ')}</span>
                  <p className="text-slate-500">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-400 block text-[10px]">{formatDateTime(log.timestamp)}</span>
                  <span className="font-semibold text-slate-700 text-[10px] capitalize">{log.actorRole}: {log.actorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Prescription</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
