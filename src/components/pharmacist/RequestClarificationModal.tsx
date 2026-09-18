import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Prescription, PharmacistRequest } from '../../types';
import { rxStore } from '../../store/rxStore';
import { MessageSquare, Send, Stethoscope, AlertTriangle, CheckCircle } from 'lucide-react';

interface RequestClarificationModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestClarificationModal: React.FC<RequestClarificationModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!prescription) return null;

  const [requestType, setRequestType] = useState<PharmacistRequest['requestType']>('dosage_clarification');
  const [message, setMessage] = useState('');

  const cannedTemplates: Record<PharmacistRequest['requestType'], string> = {
    dosage_clarification: 'Greetings Dr. ' + prescription.doctorName.replace('Dr. ', '') + '. The patient reports symptoms of fatigue. Would you recommend adjusting the current dosage or starting with a titrated lower dose for the initial week?',
    drug_interaction_query: 'Patient is currently taking concurrent chronic therapy. Please confirm if you wish to proceed with the current combination or substitute.',
    alternative_stock: 'The exact brand is temporarily out of stock in our pharmacy branch. May we dispense the bioequivalent alternative?',
    allergy_concern: 'Patient profile indicates documented allergy caution. Please confirm if patient has previously tolerated this agent.',
    other: 'Regarding prescription ' + prescription.rxCode + ': '
  };

  const handleTypeChange = (type: PharmacistRequest['requestType']) => {
    setRequestType(type);
    setMessage(cannedTemplates[type]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    rxStore.createClarificationRequest({
      prescriptionId: prescription.id,
      requestType,
      message
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Request Physician Clarification"
      subtitle={`Connecting with ${prescription.doctorName} • Prescription ${prescription.rxCode}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prescriber Info */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-medical-600" />
            <span className="font-bold text-navy-900">{prescription.doctorName}</span>
            <span className="text-slate-400">({prescription.doctorSpecialty})</span>
          </div>
          <span className="font-mono text-medical-700 font-bold">{prescription.rxCode}</span>
        </div>

        {/* Query Type Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Inquiry Category:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'dosage_clarification', label: 'Dosage Query' },
              { type: 'alternative_stock', label: 'Alternative Brand / Stock' },
              { type: 'drug_interaction_query', label: 'Interaction Concern' },
              { type: 'allergy_concern', label: 'Allergy Verification' },
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleTypeChange(item.type as any)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  requestType === item.type
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Clarification Message *
          </label>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            The physician will receive a high-priority notification with this inquiry. Prescription status will be marked as "Clarification Requested".
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Clarification</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
