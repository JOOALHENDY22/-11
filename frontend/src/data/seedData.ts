import { User, DoctorProfile, PharmacistProfile, PatientProfile, Prescription, PharmacistRequest, Notification, AuditLog } from '../types';

export const DEMO_USERS: {
  doctor: { user: User; profile: DoctorProfile };
  pharmacist: { user: User; profile: PharmacistProfile };
  patient: { user: User; profile: PatientProfile };
} = {
  doctor: {
    user: {
      id: 'usr-doc-ahmed',
      email: 'ahmed.hassan@saferx.med',
      fullName: 'Dr. Ahmed Hassan',
      role: 'doctor',
      phone: '+20 100 234 5678',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00Z'
    },
    profile: {
      id: 'prf-doc-1',
      userId: 'usr-doc-ahmed',
      licenseNumber: 'DOC-EG-84920',
      specialty: 'Consultant Cardiology & Internal Medicine',
      hospitalAffiliation: 'Cairo University Specialized Heart Center',
      clinicAddress: 'Suite 402, Elite Medical Plaza, New Cairo',
      signatureUrl: 'Dr. Ahmed Hassan, MD'
    }
  },
  pharmacist: {
    user: {
      id: 'usr-ph-omar',
      email: 'omar.ali@alshifapharmacy.com',
      fullName: 'Pharmacist Omar Ali',
      role: 'pharmacist',
      phone: '+20 111 876 5432',
      avatarUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-12T09:30:00Z'
    },
    profile: {
      id: 'prf-ph-1',
      userId: 'usr-ph-omar',
      licenseNumber: 'PH-EG-19302',
      pharmacyName: 'Al-Shifa Modern Pharmacy',
      pharmacyBranch: 'Tagamoa 5th Settlement Flagship Branch',
      pharmacyAddress: 'Building 14, Commercial District, New Cairo'
    }
  },
  patient: {
    user: {
      id: 'usr-pat-youssef',
      email: 'youssef.mohamed@patient.saferx.med',
      fullName: 'Youssef Mohamed',
      role: 'patient',
      phone: '+20 122 991 2345',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T11:15:00Z'
    },
    profile: {
      id: 'prf-pat-1',
      userId: 'usr-pat-youssef',
      nationalId: '29508140102938',
      dateOfBirth: '1995-08-14',
      gender: 'male',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa Antibiotics'],
      chronicConditions: ['Hypertension (Stage 1)', 'Mild Dyslipidemia'],
      emergencyContact: 'Mona Mohamed (Sister) - +20 109 882 1100'
    }
  }
};

export const INITIAL_PATIENTS: PatientProfile[] = [
  DEMO_USERS.patient.profile,
  {
    id: 'prf-pat-2',
    userId: 'usr-pat-sarah',
    nationalId: '29803120108871',
    dateOfBirth: '1998-03-12',
    gender: 'female',
    bloodGroup: 'A+',
    allergies: ['Aspirin / NSAIDs'],
    chronicConditions: ['Asthma (moderate)'],
    emergencyContact: 'Kareem Tarek (Husband) - +20 114 552 1199'
  },
  {
    id: 'prf-pat-3',
    userId: 'usr-pat-tarek',
    nationalId: '28011230104419',
    dateOfBirth: '1980-11-23',
    gender: 'male',
    bloodGroup: 'B+',
    allergies: [],
    chronicConditions: ['Type 2 Diabetes', 'Coronary Artery Disease'],
    emergencyContact: 'Hala Salem (Wife) - +20 100 441 9922'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-seed-1',
    rxCode: 'RX-8841-K92',
    securityPin: '7419',
    qrCodeData: 'https://saferx-health.vercel.app/?rx=RX-8841-K92&pin=7419',
    doctorId: DEMO_USERS.doctor.user.id,
    doctorName: DEMO_USERS.doctor.user.fullName,
    doctorSpecialty: DEMO_USERS.doctor.profile.specialty,
    doctorLicense: DEMO_USERS.doctor.profile.licenseNumber,
    clinicName: DEMO_USERS.doctor.profile.hospitalAffiliation,
    patientId: DEMO_USERS.patient.user.id,
    patientName: DEMO_USERS.patient.user.fullName,
    patientNationalId: DEMO_USERS.patient.profile.nationalId,
    patientDob: DEMO_USERS.patient.profile.dateOfBirth,
    patientGender: DEMO_USERS.patient.profile.gender,
    patientAllergies: DEMO_USERS.patient.profile.allergies,
    patientConditions: DEMO_USERS.patient.profile.chronicConditions,
    diagnosis: 'Essential Hypertension (Uncontrolled) & Mild Sinus Tachycardia',
    clinicalNotes: 'Patient presented with resting BP 145/92 mmHg. Baseline ECG normal sinus rhythm. Advised low-sodium DASH diet and regular aerobic exercise.',
    vitals: {
      bloodPressure: '145/92',
      heartRate: 86,
      temperature: 36.8,
      weightKg: 78
    },
    medications: [
      {
        id: 'med-item-1',
        name: 'Concor (Bisoprolol Fumarate)',
        genericName: 'Bisoprolol',
        dosage: '5 mg',
        form: 'tablet',
        frequency: '1 tablet once daily morning',
        duration: '30 days',
        timing: 'before_meal',
        quantity: 30,
        refillsAllowed: 2,
        specialInstructions: 'Take every morning before breakfast. Monitor resting heart rate.',
        drugClass: 'Beta-1 Selective Blocker'
      },
      {
        id: 'med-item-2',
        name: 'Cozaar (Losartan Potassium)',
        genericName: 'Losartan',
        dosage: '50 mg',
        form: 'tablet',
        frequency: '1 tablet once daily afternoon',
        duration: '30 days',
        timing: 'anytime',
        quantity: 30,
        refillsAllowed: 2,
        specialInstructions: 'Maintain adequate hydration. Do not take extra potassium salt substitutes.',
        drugClass: 'Angiotensin II Receptor Antagonist (ARB)'
      }
    ],
    safetyAlerts: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rx-seed-2',
    rxCode: 'RX-3190-M74',
    securityPin: '5820',
    qrCodeData: 'https://saferx-health.vercel.app/?rx=RX-3190-M74&pin=5820',
    doctorId: DEMO_USERS.doctor.user.id,
    doctorName: DEMO_USERS.doctor.user.fullName,
    doctorSpecialty: DEMO_USERS.doctor.profile.specialty,
    doctorLicense: DEMO_USERS.doctor.profile.licenseNumber,
    clinicName: DEMO_USERS.doctor.profile.hospitalAffiliation,
    patientId: DEMO_USERS.patient.user.id,
    patientName: DEMO_USERS.patient.user.fullName,
    patientNationalId: DEMO_USERS.patient.profile.nationalId,
    patientDob: DEMO_USERS.patient.profile.dateOfBirth,
    patientGender: DEMO_USERS.patient.profile.gender,
    patientAllergies: DEMO_USERS.patient.profile.allergies,
    patientConditions: DEMO_USERS.patient.profile.chronicConditions,
    diagnosis: 'Acute Bacterial Sinusitis with Tension Headache',
    clinicalNotes: 'Avoided Penicillin antibiotics due to documented anaphylactoid history. Prescribed Azithromycin course.',
    vitals: {
      bloodPressure: '128/82',
      heartRate: 74,
      temperature: 37.9,
      weightKg: 78
    },
    medications: [
      {
        id: 'med-item-3',
        name: 'Zithromax (Azithromycin)',
        genericName: 'Azithromycin',
        dosage: '500 mg',
        form: 'tablet',
        frequency: '1 tablet once daily for 5 days',
        duration: '5 days',
        timing: 'before_meal',
        quantity: 5,
        refillsAllowed: 0,
        specialInstructions: 'Complete the entire 5-day course even if symptoms resolve.',
        drugClass: 'Macrolide Antibiotic'
      },
      {
        id: 'med-item-4',
        name: 'Panadol Extra (Paracetamol / Caffeine)',
        genericName: 'Paracetamol + Caffeine',
        dosage: '500 mg / 65 mg',
        form: 'tablet',
        frequency: '1 tablet every 8 hours as needed for headache',
        duration: '5 days',
        timing: 'after_meal',
        quantity: 15,
        refillsAllowed: 0,
        specialInstructions: 'Do not exceed 6 tablets within 24 hours.',
        drugClass: 'Non-Opioid Analgesic / Antipyretic'
      }
    ],
    safetyAlerts: [],
    status: 'dispensed',
    createdAt: '2026-08-10T14:30:00Z',
    expiresAt: '2026-09-10T14:30:00Z',
    dispensedAt: '2026-08-10T16:45:00Z',
    dispensedByPharmacistId: DEMO_USERS.pharmacist.user.id,
    dispensedByPharmacistName: DEMO_USERS.pharmacist.user.fullName,
    dispensedByPharmacyName: DEMO_USERS.pharmacist.profile.pharmacyName,
    dispensingBatchNumber: 'BATCH-2026-ZITH-994',
    dispensingNotes: 'Verified patient identity. Counselled on taking Azithromycin on an empty stomach 1 hr before meals.'
  }
];

export const INITIAL_REQUESTS: PharmacistRequest[] = [
  {
    id: 'req-seed-1',
    prescriptionId: 'rx-seed-1',
    rxCode: 'RX-8841-K92',
    pharmacistId: DEMO_USERS.pharmacist.user.id,
    pharmacistName: DEMO_USERS.pharmacist.user.fullName,
    pharmacyName: DEMO_USERS.pharmacist.profile.pharmacyName,
    doctorId: DEMO_USERS.doctor.user.id,
    doctorName: DEMO_USERS.doctor.user.fullName,
    patientName: DEMO_USERS.patient.user.fullName,
    requestType: 'dosage_clarification',
    message: 'Greetings Dr. Ahmed. The patient mentioned slight morning dizziness. Would you like to keep Bisoprolol at 5mg or adjust to 2.5mg for the first week?',
    doctorResponse: 'Thank you Pharmacist Omar. Let us start with 2.5mg for 7 days then escalate to 5mg if tolerated. Dispensing approved for split dose pack.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: DEMO_USERS.patient.user.id,
    recipientRole: 'patient',
    title: 'New Prescription Created',
    message: 'Dr. Ahmed Hassan has issued prescription RX-8841-K92 for your Hypertension management.',
    type: 'rx_created',
    prescriptionId: 'rx-seed-1',
    rxCode: 'RX-8841-K92',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-2',
    userId: DEMO_USERS.doctor.user.id,
    recipientRole: 'doctor',
    title: 'Prescription Accessed by Pharmacist',
    message: 'Pharmacist Omar Ali (Al-Shifa Modern Pharmacy) verified and opened prescription RX-8841-K92.',
    type: 'rx_accessed',
    prescriptionId: 'rx-seed-1',
    rxCode: 'RX-8841-K92',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-3',
    userId: DEMO_USERS.pharmacist.user.id,
    recipientRole: 'pharmacist',
    title: 'Doctor Responded to Clarification',
    message: 'Dr. Ahmed Hassan responded to your dosage query on RX-8841-K92.',
    type: 'clarification_resolved',
    prescriptionId: 'rx-seed-1',
    rxCode: 'RX-8841-K92',
    isRead: true,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    prescriptionId: 'rx-seed-1',
    actorId: DEMO_USERS.doctor.user.id,
    actorName: DEMO_USERS.doctor.user.fullName,
    actorRole: 'doctor',
    action: 'PRESCRIPTION_CREATED',
    details: 'Created digital prescription with 2 medications and zero allergy conflicts.',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'aud-2',
    prescriptionId: 'rx-seed-1',
    actorId: DEMO_USERS.pharmacist.user.id,
    actorName: DEMO_USERS.pharmacist.user.fullName,
    actorRole: 'pharmacist',
    action: 'PRESCRIPTION_ACCESSED_PHARMACIST',
    details: 'Pharmacist entered valid RX Code and passed Step 1 identity verification.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];
