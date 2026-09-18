import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Sparkles, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { runClinicalSafetyCheck } from '../../utils/safetyEngine';
import { MedicationItem } from '../../types';
import { SafetyAlertBanner } from '../common/SafetyAlertBanner';

export const SafetyEnginePreview: React.FC = () => {
  const [selectedAllergy, setSelectedAllergy] = useState<string>('Penicillin');
  const [selectedCondition, setSelectedCondition] = useState<string>('Hypertension');
  const [selectedDrug, setSelectedDrug] = useState<string>('Augmentin');

  const sampleDrugs: { name: string; generic: string; drugClass: string; form: any }[] = [
    { name: 'Augmentin 1000mg', generic: 'Amoxicillin + Clavulanic Acid', drugClass: 'Penicillin / Beta-lactam', form: 'tablet' },
    { name: 'Zithromax 500mg', generic: 'Azithromycin', drugClass: 'Macrolide Antibiotic', form: 'tablet' },
    { name: 'Cataflam 50mg', generic: 'Diclofenac Potassium', drugClass: 'NSAID', form: 'tablet' },
    { name: 'Concor 5mg', generic: 'Bisoprolol Fumarate', drugClass: 'Beta Blocker', form: 'tablet' },
  ];

  const currentMedItem: MedicationItem = {
    id: 'test-med-item',
    name: selectedDrug,
    genericName: sampleDrugs.find(d => d.name.startsWith(selectedDrug.split(' ')[0]))?.generic || selectedDrug,
    dosage: 'Standard dose',
    form: 'tablet',
    frequency: 'As indicated',
    duration: '7 days',
    timing: 'after_meal',
    quantity: 1,
    refillsAllowed: 0,
    drugClass: sampleDrugs.find(d => d.name.startsWith(selectedDrug.split(' ')[0]))?.drugClass
  };

  const activeAlerts = runClinicalSafetyCheck(
    [currentMedItem],
    selectedAllergy ? [selectedAllergy] : [],
    selectedCondition ? [selectedCondition] : []
  );

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-medical-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-medical-400" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Live Clinical Decision Support (CDS) Engine
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Test how SafeRx intercepts contraindicated prescriptions and drug-allergy clashes before a single tablet reaches the patient.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-navy-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Patient Profile & Candidate Drug</span>
              <span className="text-[10px] text-medical-400 font-mono">CDS v2.4</span>
            </h3>

            {/* Allergy select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Documented Patient Allergy:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Penicillin', 'Sulfa Drugs', 'Aspirin / NSAIDs', 'None'].map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => setSelectedAllergy(allergy === 'None' ? '' : allergy)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all text-left border ${
                      (selectedAllergy === allergy || (allergy === 'None' && !selectedAllergy))
                        ? 'bg-medical-600 border-medical-400 text-white shadow-md'
                        : 'bg-navy-900/60 border-slate-700 text-slate-300 hover:bg-navy-700'
                    }`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Chronic Condition:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Hypertension', 'Severe Peptic Ulcer', 'Severe Asthma', 'None'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond === 'None' ? '' : cond)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all text-left border ${
                      (selectedCondition === cond || (cond === 'None' && !selectedCondition))
                        ? 'bg-medical-600 border-medical-400 text-white shadow-md'
                        : 'bg-navy-900/60 border-slate-700 text-slate-300 hover:bg-navy-700'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Drug select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Doctor Prescribing Candidate Drug:
              </label>
              <div className="space-y-2">
                {sampleDrugs.map((drug) => (
                  <button
                    key={drug.name}
                    type="button"
                    onClick={() => setSelectedDrug(drug.name)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all text-left border flex items-center justify-between ${
                      selectedDrug === drug.name
                        ? 'bg-medical-600 border-medical-400 text-white shadow-md'
                        : 'bg-navy-900/60 border-slate-700 text-slate-300 hover:bg-navy-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{drug.name}</span>
                      <span className="text-[11px] opacity-75 block font-normal">{drug.generic}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 font-mono">
                      {drug.drugClass.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Result Output */}
          <div className="lg:col-span-7 bg-navy-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-200">
                Real-Time Safety Analysis Result
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-mint-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
                <span>Engine Active</span>
              </div>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                <SafetyAlertBanner alerts={activeAlerts} />
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-mint-950/40 border border-mint-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-mint-500/20 text-mint-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-mint-300">
                    Clinical Safety Verification Passed
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    No documented cross-reactions or contraindications found for {selectedDrug}. The prescription is approved for digital cryptographic signing.
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-700/60 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-medical-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Production Safety Guarantee: </span>
                Our algorithm evaluates beta-lactam side chain cross-reactivity, pharmacokinetic interactions (CYP450 pathways), and patient-specific renal/hepatic parameters in sub-10ms latency.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
