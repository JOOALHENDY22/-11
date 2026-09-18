export interface MedicationDatabaseItem {
  id: string;
  name: string;
  genericName: string;
  drugClass: string;
  category: 'Antibiotic' | 'Cardiovascular' | 'Analgesic' | 'Antidiabetic' | 'Respiratory' | 'Gastrointestinal' | 'Psychiatric';
  availableDosages: string[];
  forms: ('tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'drops' | 'cream')[];
  defaultFrequency: string;
  defaultTiming: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime' | 'at_bedtime';
  knownAllergens: string[]; // e.g., ["Penicillin", "Beta-lactam"]
  contraindicatedConditions: string[]; // e.g., ["Asthma", "Renal Failure", "Hypertension"]
  interactions: {
    interactingDrugClassOrName: string;
    severity: 'critical' | 'warning';
    description: string;
  }[];
}

export const MOCK_MEDICATION_CATALOG: MedicationDatabaseItem[] = [
  {
    id: 'med-1',
    name: 'Augmentin (Amoxicillin / Clavulanate)',
    genericName: 'Amoxicillin + Clavulanic Acid',
    drugClass: 'Penicillin / Beta-lactam Antibiotic',
    category: 'Antibiotic',
    availableDosages: ['625 mg', '1000 mg (1 g)', '375 mg'],
    forms: ['tablet', 'syrup'],
    defaultFrequency: '1 tablet twice daily',
    defaultTiming: 'with_meal',
    knownAllergens: ['Penicillin', 'Beta-lactam', 'Amoxicillin'],
    contraindicatedConditions: ['Severe Hepatic Impairment', 'Cholestatic Jaundice'],
    interactions: [
      {
        interactingDrugClassOrName: 'Warfarin',
        severity: 'warning',
        description: 'May prolong bleeding time and increase INR with anticoagulants.'
      },
      {
        interactingDrugClassOrName: 'Methotrexate',
        severity: 'critical',
        description: 'Penicillins reduce methotrexate excretion, risking acute toxicity.'
      }
    ]
  },
  {
    id: 'med-2',
    name: 'Amoxil',
    genericName: 'Amoxicillin',
    drugClass: 'Penicillin Antibiotic',
    category: 'Antibiotic',
    availableDosages: ['500 mg', '250 mg', '875 mg'],
    forms: ['capsule', 'syrup'],
    defaultFrequency: '1 capsule every 8 hours',
    defaultTiming: 'after_meal',
    knownAllergens: ['Penicillin', 'Beta-lactam', 'Amoxicillin'],
    contraindicatedConditions: ['Infectious Mononucleosis'],
    interactions: [
      {
        interactingDrugClassOrName: 'Allopurinol',
        severity: 'warning',
        description: 'Higher incidence of skin rashes when combined.'
      }
    ]
  },
  {
    id: 'med-3',
    name: 'Zithromax (Azithromycin)',
    genericName: 'Azithromycin',
    drugClass: 'Macrolide Antibiotic',
    category: 'Antibiotic',
    availableDosages: ['500 mg', '250 mg'],
    forms: ['tablet', 'syrup'],
    defaultFrequency: '1 tablet once daily for 3-5 days',
    defaultTiming: 'before_meal',
    knownAllergens: ['Macrolide', 'Azithromycin'],
    contraindicatedConditions: ['Severe QT Prolongation', 'Hepatic Dysfunction'],
    interactions: [
      {
        interactingDrugClassOrName: 'Amiodarone',
        severity: 'critical',
        description: 'Risk of fatal QT prolongation and torsades de pointes.'
      }
    ]
  },
  {
    id: 'med-4',
    name: 'Concor (Bisoprolol Fumarate)',
    genericName: 'Bisoprolol',
    drugClass: 'Beta-1 Selective Blocker',
    category: 'Cardiovascular',
    availableDosages: ['2.5 mg', '5 mg', '10 mg'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet once daily morning',
    defaultTiming: 'before_meal',
    knownAllergens: ['Bisoprolol', 'Beta Blockers'],
    contraindicatedConditions: ['Severe Bradycardia', 'Asthma (severe)', 'AV Block 2nd/3rd degree'],
    interactions: [
      {
        interactingDrugClassOrName: 'Verapamil',
        severity: 'critical',
        description: 'Severe hypotension, bradycardia, and risk of heart block.'
      },
      {
        interactingDrugClassOrName: 'Diltiazem',
        severity: 'warning',
        description: 'Additive negative inotropic and chronotropic effects.'
      }
    ]
  },
  {
    id: 'med-5',
    name: 'Cozaar (Losartan Potassium)',
    genericName: 'Losartan',
    drugClass: 'Angiotensin II Receptor Antagonist (ARB)',
    category: 'Cardiovascular',
    availableDosages: ['50 mg', '100 mg', '25 mg'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet once daily',
    defaultTiming: 'anytime',
    knownAllergens: ['Losartan'],
    contraindicatedConditions: ['Pregnancy', 'Severe Renal Artery Stenosis'],
    interactions: [
      {
        interactingDrugClassOrName: 'Spironolactone',
        severity: 'warning',
        description: 'Synergistic risk of hyperkalemia (high blood potassium levels).'
      },
      {
        interactingDrugClassOrName: 'Potassium Supplements',
        severity: 'warning',
        description: 'Risk of dangerous hyperkalemia and cardiac arrhythmia.'
      }
    ]
  },
  {
    id: 'med-6',
    name: 'Lipitor (Atorvastatin Calcium)',
    genericName: 'Atorvastatin',
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    category: 'Cardiovascular',
    availableDosages: ['10 mg', '20 mg', '40 mg', '80 mg'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet once daily at night',
    defaultTiming: 'at_bedtime',
    knownAllergens: ['Atorvastatin'],
    contraindicatedConditions: ['Active Liver Disease', 'Pregnancy'],
    interactions: [
      {
        interactingDrugClassOrName: 'Clarithromycin',
        severity: 'critical',
        description: 'Significantly raises statin serum levels, causing severe rhabdomyolysis / myopathy.'
      },
      {
        interactingDrugClassOrName: 'Gemfibrozil',
        severity: 'critical',
        description: 'Extreme risk of muscle breakdown and rhabdomyolysis.'
      }
    ]
  },
  {
    id: 'med-7',
    name: 'Glucophage (Metformin HCl)',
    genericName: 'Metformin',
    drugClass: 'Biguanide Antidiabetic',
    category: 'Antidiabetic',
    availableDosages: ['500 mg', '850 mg', '1000 mg XR'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet twice daily with meals',
    defaultTiming: 'with_meal',
    knownAllergens: ['Metformin'],
    contraindicatedConditions: ['Severe Renal Impairment (eGFR < 30)', 'Metabolic Acidosis'],
    interactions: [
      {
        interactingDrugClassOrName: 'Iodinated Contrast Media',
        severity: 'critical',
        description: 'Must withhold before imaging to prevent acute renal failure and lactic acidosis.'
      }
    ]
  },
  {
    id: 'med-8',
    name: 'Nexium (Esomeprazole Magnesium)',
    genericName: 'Esomeprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    category: 'Gastrointestinal',
    availableDosages: ['20 mg', '40 mg'],
    forms: ['tablet', 'capsule'],
    defaultFrequency: '1 tablet once daily 30 min before breakfast',
    defaultTiming: 'before_meal',
    knownAllergens: ['Esomeprazole', 'PPIs'],
    contraindicatedConditions: ['Hypomagnesemia'],
    interactions: [
      {
        interactingDrugClassOrName: 'Clopidogrel',
        severity: 'warning',
        description: 'May diminish antiplatelet effect of clopidogrel through CYP2C19 inhibition.'
      }
    ]
  },
  {
    id: 'med-9',
    name: 'Panadol Extra (Paracetamol / Caffeine)',
    genericName: 'Paracetamol + Caffeine',
    drugClass: 'Non-Opioid Analgesic / Antipyretic',
    category: 'Analgesic',
    availableDosages: ['500 mg / 65 mg'],
    forms: ['tablet'],
    defaultFrequency: '1-2 tablets every 6 hours as needed (Max 4g/day)',
    defaultTiming: 'after_meal',
    knownAllergens: ['Paracetamol', 'Acetaminophen'],
    contraindicatedConditions: ['Severe Hepatic Failure'],
    interactions: [
      {
        interactingDrugClassOrName: 'Alcohol (chronic excessive)',
        severity: 'warning',
        description: 'Elevates hepatotoxicity risk.'
      }
    ]
  },
  {
    id: 'med-10',
    name: 'Cataflam (Diclofenac Potassium)',
    genericName: 'Diclofenac',
    drugClass: 'NSAID (Nonsteroidal Anti-inflammatory)',
    category: 'Analgesic',
    availableDosages: ['50 mg', '25 mg'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet 2-3 times daily after meals',
    defaultTiming: 'after_meal',
    knownAllergens: ['Diclofenac', 'NSAID', 'Aspirin'],
    contraindicatedConditions: ['Active Peptic Ulcer', 'Severe Heart Failure', 'Hypertension (uncontrolled)'],
    interactions: [
      {
        interactingDrugClassOrName: 'Warfarin',
        severity: 'critical',
        description: 'Substantial increase in gastrointestinal ulceration and major bleeding.'
      },
      {
        interactingDrugClassOrName: 'Losartan',
        severity: 'warning',
        description: 'NSAIDs blunt antihypertensive efficacy and may worsen renal function.'
      }
    ]
  },
  {
    id: 'med-11',
    name: 'Ventolin Evohaler (Salbutamol)',
    genericName: 'Salbutamol / Albuterol',
    drugClass: 'Short-acting Beta-2 Agonist (SABA)',
    category: 'Respiratory',
    availableDosages: ['100 mcg/dose'],
    forms: ['inhaler'],
    defaultFrequency: '1-2 puffs as needed for shortness of breath',
    defaultTiming: 'anytime',
    knownAllergens: ['Salbutamol'],
    contraindicatedConditions: ['Thyrotoxicosis (caution)'],
    interactions: [
      {
        interactingDrugClassOrName: 'Beta Blockers (Non-selective)',
        severity: 'critical',
        description: 'Directly antagonizes bronchodilatory action and may provoke acute severe bronchospasm.'
      }
    ]
  },
  {
    id: 'med-12',
    name: 'Coumadin (Warfarin Sodium)',
    genericName: 'Warfarin',
    drugClass: 'Vitamin K Antagonist (Anticoagulant)',
    category: 'Cardiovascular',
    availableDosages: ['1 mg', '2 mg', '5 mg'],
    forms: ['tablet'],
    defaultFrequency: '1 tablet once daily at 6 PM as per INR',
    defaultTiming: 'anytime',
    knownAllergens: ['Warfarin'],
    contraindicatedConditions: ['Active Bleeding', 'Hemorrhagic Tendencies', 'Pregnancy'],
    interactions: [
      {
        interactingDrugClassOrName: 'Aspirin / NSAIDs',
        severity: 'critical',
        description: 'Severe synergistic risk of gastrointestinal hemorrhage and intracranial bleed.'
      },
      {
        interactingDrugClassOrName: 'Augmentin',
        severity: 'warning',
        description: 'Gut flora alteration increases INR and bleeding vulnerability.'
      }
    ]
  }
];
