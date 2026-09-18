export type UserRole = 'doctor' | 'pharmacist' | 'patient';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specialty: string;
  hospitalAffiliation: string;
  clinicAddress: string;
  signatureUrl?: string;
}

export interface PharmacistProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  pharmacyName: string;
  pharmacyBranch: string;
  pharmacyAddress: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[]; // e.g., ["Penicillin", "Sulfa Drugs"]
  chronicConditions: string[]; // e.g., ["Hypertension", "Type 2 Diabetes"]
  emergencyContact?: string;
}

export type PrescriptionStatus = 
  | 'active'       // Created by doctor, ready to present
  | 'verified'     // Pharmacist scanned and verified
  | 'clarification'// Pharmacist asked for doctor clarification
  | 'dispensed'    // Fully dispensed by pharmacist
  | 'cancelled';   // Cancelled or revoked

export interface MedicationItem {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'drops' | 'cream';
  frequency: string; // e.g., "1 tablet every 8 hours"
  duration: string;  // e.g., "7 days"
  timing: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime' | 'at_bedtime';
  quantity: number;
  refillsAllowed: number;
  specialInstructions?: string;
  drugClass?: string;
}

export interface SafetyAlert {
  id: string;
  type: 'allergy' | 'drug_interaction' | 'dosage_warning' | 'duplicate_therapy';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  involvedItems: string[];
  recommendation?: string;
}

export interface Prescription {
  id: string;
  rxCode: string; // Unique human-readable code e.g. "RX-7894-K92"
  securityPin: string; // 4-digit verification PIN
  qrCodeData: string; // Encrypted / formatted JSON string or secure URL
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  patientNationalId: string;
  patientDob: string;
  patientGender: string;
  patientAllergies: string[];
  patientConditions: string[];
  diagnosis: string;
  clinicalNotes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weightKg?: number;
  };
  medications: MedicationItem[];
  safetyAlerts: SafetyAlert[];
  status: PrescriptionStatus;
  createdAt: string;
  expiresAt: string;
  dispensedAt?: string;
  dispensedByPharmacistId?: string;
  dispensedByPharmacistName?: string;
  dispensedByPharmacyName?: string;
  dispensingBatchNumber?: string;
  dispensingNotes?: string;
  pharmacistAccessedAt?: string;
}

export interface PharmacistRequest {
  id: string;
  prescriptionId: string;
  rxCode: string;
  pharmacistId: string;
  pharmacistName: string;
  pharmacyName: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  requestType: 'dosage_clarification' | 'drug_interaction_query' | 'alternative_stock' | 'allergy_concern' | 'other';
  message: string;
  doctorResponse?: string;
  status: 'pending' | 'resolved' | 'declined';
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type: 'rx_created' | 'rx_accessed' | 'rx_verified' | 'clarification_requested' | 'clarification_resolved' | 'rx_dispensed' | 'safety_alert';
  prescriptionId?: string;
  rxCode?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  prescriptionId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'PRESCRIPTION_CREATED' | 'PRESCRIPTION_VIEWED_PATIENT' | 'PRESCRIPTION_ACCESSED_PHARMACIST' | 'PRESCRIPTION_VERIFIED' | 'CLARIFICATION_REQUESTED' | 'CLARIFICATION_ANSWERED' | 'PRESCRIPTION_DISPENSED';
  details: string;
  ipAddress?: string;
  timestamp: string;
}
