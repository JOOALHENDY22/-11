import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PharmacistRequest } from '../../types';
import { rxStore } from '../../store/rxStore';
import { MessageSquare, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DoctorClarificationModalProps {
  request: PharmacistRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAnswered?: () => void;
}

export const DoctorClarificationModal: React.FC<DoctorClarificationModalProps> = ({
  request,
  isOpen,
  onClose,
  onAnswered
}) => {
  if (!request) return null;

  const [responseMessage, setResponseMessage] = useState('');

  const quickReplies = [
    'Approved. Please dispense split dosage as requested.',
    'Alternative brand is acceptable if bioequivalent.',
    'Confirmed. Patient is tolerant to this combination under monitoring.',
    'Please withhold Item #2; I will issue an amended order shortly.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;

    rxStore.answerClarificationRequest(request.id, responseMessage);
    if (onAnswered) onAnswered();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Pharmacist Inquiry Response"
      subtitle={`Prescription: ${request.rxCode} • Patient: ${request.patientName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pharmacist Query Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 uppercase tracking-wider">
              From: {request.pharmacistName} ({request.pharmacyName})
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold capitalize text-[10px]">
              {request.requestType.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-800 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-amber-100">
            "{request.message}"
          </p>
        </div>

        {/* Quick Canned Responses */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Quick Physician Directives:
          </label>
          <div className="space-y-1.5">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setResponseMessage(reply)}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-medical-50 text-slate-700 hover:text-medical-800 text-xs transition-colors border border-slate-200/80"
              >
                "{reply}"
              </button>
            ))}
          </div>
        </div>

        {/* Response Text Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Physician Clinical Response & Dispense Instructions *
          </label>
          <textarea
            rows={3}
            required
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Type your official clinical directive for the dispensing pharmacist..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-medical-500 focus:outline-none"
          />
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
            className="px-5 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Response & Unlock Dispensing</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
