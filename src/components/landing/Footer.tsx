import React from 'react';
import { ShieldCheck, Heart, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 py-12 border-t border-navy-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-900">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-medical-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Safe<span className="text-medical-400">Rx</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The secure communication and medication-safety bridge uniting physicians, dispensing pharmacists, and patients.
            </p>
          </div>

          {/* Clinical Pillars */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Clinical Pillars</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Drug-Allergy Interaction CDS</li>
              <li>Encrypted QR Prescriptions</li>
              <li>Direct Doctor-Pharmacy Channel</li>
              <li>Patient Medication Wallet</li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Standards & Security</h4>
            <ul className="space-y-2 text-slate-400">
              <li>PostgreSQL RLS Architecture</li>
              <li>Zero Patient-Name Search Exposure</li>
              <li>Tamper-Proof Audit Logging</li>
              <li>HL7 / FHIR Interoperability Ready</li>
            </ul>
          </div>

          {/* Demo Personas */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Active Demo Profiles</h4>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-medical-400 font-semibold">Doctor:</span> Dr. Ahmed Hassan</li>
              <li><span className="text-blue-400 font-semibold">Pharmacist:</span> Pharm. Omar Ali</li>
              <li><span className="text-mint-400 font-semibold">Patient:</span> Youssef Mohamed</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 SafeRx Health Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-mint-500" />
            <span>End-to-End Encrypted Healthcare Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
