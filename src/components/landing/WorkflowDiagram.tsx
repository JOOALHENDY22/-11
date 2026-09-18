import React, { useState } from 'react';
import { 
  Stethoscope, 
  QrCode, 
  ShieldCheck, 
  Pill, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  Bell, 
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';

export const WorkflowDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: 'Doctor Prescribes',
      subtitle: 'Clinical Intake & CDS Guard',
      icon: <Stethoscope className="w-6 h-6 text-medical-600" />,
      tag: 'Doctor Station',
      desc: 'The doctor diagnoses the patient, inputs vitals, selects medications from the verified formulary, and receives real-time allergy & drug-drug warnings.',
      badge: 'Auto-Verification Active'
    },
    {
      id: 2,
      title: 'Patient Receives Pass',
      subtitle: 'Encrypted QR & Mobile Code',
      icon: <QrCode className="w-6 h-6 text-mint-600" />,
      tag: 'Patient Pass',
      desc: 'Patient receives an instant notification with an 8-digit unique RX Code and scannable high-resolution QR pass. No lost paper slips or illegible handwriting.',
      badge: 'Zero Exposure to Unauthorized Parties'
    },
    {
      id: 3,
      title: 'Pharmacist Accesses',
      subtitle: 'Strict Identity Verification',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      tag: 'Pharmacy Station',
      desc: 'Pharmacist scans the QR or enters the unique code. System displays mandatory Step-1 Verification modal (Patient, Prescriber, Date, Status). Patient name search is locked.',
      badge: 'HIPAA & GDPR Compliant'
    },
    {
      id: 4,
      title: 'Dispense & Notify',
      subtitle: 'Lot Logging & Real-time Sync',
      icon: <Pill className="w-6 h-6 text-emerald-600" />,
      tag: 'Safe Dispensing',
      desc: 'Pharmacist logs lot/batch number, confirms clinical notes, dispenses, and both Doctor & Patient receive instant delivery confirmations.',
      badge: 'Immutable Audit Trail'
    }
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5 text-navy-800" />
            <span>End-to-End Encrypted Prescription Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            How SafeRx Bridges Healthcare
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Click each phase to inspect how safety checks, cryptographic verification, and doctor-pharmacist communication interact in real time.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activeStep === s.id
                  ? 'bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-950/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  activeStep === s.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  Phase 0{s.id}
                </span>
                {activeStep === s.id && (
                  <span className="w-2 h-2 rounded-full bg-medical-400 animate-ping" />
                )}
              </div>
              <h4 className="font-bold text-sm tracking-tight">{s.title}</h4>
              <p className={`text-[11px] mt-0.5 truncate ${
                activeStep === s.id ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {s.subtitle}
              </p>
            </button>
          ))}
        </div>

        {/* Active Step Feature Showcase */}
        {(() => {
          const current = steps.find(s => s.id === activeStep) || steps[0];
          return (
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-medical-50/30 rounded-3xl p-8 border border-slate-200/90 shadow-sm animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-navy-900 text-xs font-bold shadow-xs">
                    {current.icon}
                    <span>{current.tag}</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                    {current.title} — {current.subtitle}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-mint-100 text-mint-800 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-mint-700" />
                      {current.badge}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Live System Status
                  </div>

                  {activeStep === 1 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Prescribing MD:</span>
                        <span className="font-bold text-navy-900">Dr. Ahmed Hassan</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Allergy Scan:</span>
                        <span className="font-bold text-mint-600">0 Conflicts</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-medical-50 text-medical-800 font-bold">
                        <span>Digital Signature:</span>
                        <span>SHA-256 Validated</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Assigned Patient:</span>
                        <span className="font-bold text-navy-900">Youssef Mohamed</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Prescription Code:</span>
                        <span className="font-mono font-bold text-medical-700">RX-8841-K92</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-mint-50 text-mint-800 font-bold">
                        <span>Pass Readiness:</span>
                        <span>Ready to scan</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Access Point:</span>
                        <span className="font-bold text-navy-900">Al-Shifa Pharmacy</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Security Gate:</span>
                        <span className="font-bold text-blue-600">Code Verified ✓</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-amber-50 text-amber-800 font-bold">
                        <span>Doctor Clarification:</span>
                        <span>Channel Ready</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Dispensing Pharmacist:</span>
                        <span className="font-bold text-navy-900">Omar Ali, RPh</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Lot Tracking:</span>
                        <span className="font-mono font-bold text-slate-800">BATCH-2026-994</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-mint-50 text-mint-800 font-bold">
                        <span>EHR Sync:</span>
                        <span>Doctor & Patient Notified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
