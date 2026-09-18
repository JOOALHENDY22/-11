import { 
  User, 
  DoctorProfile, 
  PharmacistProfile, 
  PatientProfile, 
  Prescription, 
  PharmacistRequest, 
  Notification, 
  AuditLog, 
  UserRole,
  MedicationItem,
  SafetyAlert
} from '../types';
import { runClinicalSafetyCheck } from '../utils/safetyEngine';
import { supabaseService } from '../services/supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'saferx_current_user',
  CURRENT_ROLE: 'saferx_current_role',
  PRESCRIPTIONS: 'saferx_prescriptions_clean',
  REQUESTS: 'saferx_requests_clean',
  NOTIFICATIONS: 'saferx_notifications_clean',
  AUDIT_LOGS: 'saferx_audit_logs_clean',
  PATIENTS: 'saferx_patients_clean'
};

type StoreListener = () => void;

class RxStore {
  private currentUser: User | null = null;
  private currentRole: UserRole | null = null;
  private prescriptions: Prescription[] = [];
  private requests: PharmacistRequest[] = [];
  private notifications: Notification[] = [];
  private auditLogs: AuditLog[] = [];
  private patients: PatientProfile[] = [];
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }

      const savedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole;
      if (savedRole) {
        this.currentRole = savedRole;
      }

      // Initialize clean user data (Starts empty if new)
      const savedRx = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      this.prescriptions = savedRx ? JSON.parse(savedRx) : [];

      const savedReqs = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      this.requests = savedReqs ? JSON.parse(savedReqs) : [];

      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : [];

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedLogs ? JSON.parse(savedLogs) : [];

      const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      this.patients = savedPatients ? JSON.parse(savedPatients) : [];

      this.persistAll();
    } catch (err) {
      console.error('Failed to initialize RxStore from localStorage', err);
      this.clearAllData();
    }
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private persistAll() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }

      if (this.currentRole) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, this.currentRole);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
      }

      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(this.prescriptions));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.requests));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(this.patients));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public clearAllData() {
    this.prescriptions = [];
    this.requests = [];
    this.notifications = [];
    this.auditLogs = [];
    this.patients = [];
    this.currentUser = null;
    this.currentRole = null;
    this.persistAll();
    this.notify();
  }

  public resetToDemoData() {
    this.clearAllData();
  }

  // --- USER & AUTH ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentRole(): UserRole | null {
    return this.currentRole;
  }

  public setCurrentRole(role: UserRole | null) {
    this.currentRole = role;
    this.persistAll();
    this.notify();
  }

  public switchRole(role: UserRole) {
    this.loginWithRole({
      email: `${role}@saferx.med`,
      fullName: role === 'doctor' ? 'د. الطبيب المعالج' : role === 'pharmacist' ? 'الصيدلي المسؤول' : 'المريض',
      role
    });
  }

  public loginWithRole(user: { email: string; fullName: string; role: UserRole; phone?: string }) {
    this.currentUser = {
      id: `usr-${Date.now()}`,
      email: user.email,
      fullName: user.fullName || user.email.split('@')[0],
      role: user.role,
      phone: user.phone,
      createdAt: new Date().toISOString()
    };
    this.currentRole = user.role;
    this.persistAll();
    this.notify();
  }

  public loginUser(email: string, role: UserRole) {
    this.loginWithRole({
      email,
      fullName: role === 'doctor' ? 'د. الطبيب المعالج' : role === 'pharmacist' ? 'الصيدلي المسؤول' : 'المريض',
      role
    });
  }

  public registerUser(userData: Partial<User>, roleData: any) {
    this.loginWithRole({
      email: userData.email || 'user@saferx.med',
      fullName: userData.fullName || 'User',
      role: (userData.role || 'patient') as UserRole,
      phone: userData.phone
    });
  }

  public logout() {
    this.currentUser = null;
    this.currentRole = null;
    this.persistAll();
    this.notify();
  }

  // --- PRESCRIPTIONS ---
  public getPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  public async getPrescriptionByCode(rxCode: string): Promise<Prescription | undefined> {
    const clean = rxCode.trim().toUpperCase();
    // 1. Check local cache
    let found = this.prescriptions.find((p) => p.rxCode.toUpperCase() === clean);
    if (found) return found;

    // 2. Query Supabase remote database
    const remoteRx = await supabaseService.fetchPrescriptionByCode(clean);
    if (remoteRx) {
      this.prescriptions.unshift(remoteRx);
      this.persistAll();
      this.notify();
      return remoteRx;
    }

    return undefined;
  }

  public getPrescriptionById(id: string): Prescription | undefined {
    return this.prescriptions.find((p) => p.id === id);
  }

  public getDoctorPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  public getPatientPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  public async createPrescription(data: {
    doctorName?: string;
    doctorSpecialty?: string;
    patientName: string;
    patientNationalId?: string;
    patientDob?: string;
    patientGender?: string;
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
  }): Promise<Prescription> {
    // Generate clean distinctive RX code: RX-XXXX-XXX
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const rxCode = `RX-${randomChars}-${randomSuffix}`;
    const securityPin = Math.floor(1000 + Math.random() * 9000).toString();

    const doctorName = data.doctorName || this.currentUser?.fullName || 'د. الطبيب المعالج';
    const doctorSpecialty = data.doctorSpecialty || 'طبيب استشاري';

    // Run safety engine
    const safetyAlerts = runClinicalSafetyCheck(
      data.medications,
      data.patientAllergies,
      data.patientConditions
    );

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      rxCode,
      securityPin,
      qrCodeData: JSON.stringify({
        code: rxCode,
        pin: securityPin,
        pat: data.patientName,
        doc: doctorName,
        date: new Date().toISOString().split('T')[0],
        v: '1.0'
      }),
      doctorId: this.currentUser?.id || `doc-${Date.now()}`,
      doctorName,
      doctorSpecialty,
      doctorLicense: 'DOC-EG-APPROVED',
      clinicName: 'العيادة التخصصية',
      patientId: `pat-${Date.now()}`,
      patientName: data.patientName,
      patientNationalId: data.patientNationalId || '',
      patientDob: data.patientDob || '',
      patientGender: data.patientGender || 'male',
      patientAllergies: data.patientAllergies,
      patientConditions: data.patientConditions,
      diagnosis: data.diagnosis,
      clinicalNotes: data.clinicalNotes,
      vitals: data.vitals,
      medications: data.medications,
      safetyAlerts,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.prescriptions.unshift(newRx);

    // Save to Supabase remote database in parallel
    supabaseService.savePrescription(newRx).catch(err => console.warn('[Supabase Sync]', err));

    this.persistAll();
    this.notify();
    return newRx;
  }

  public async dispensePrescription(rxIdOrCode: string, data: {
    batchNumber: string;
    notes?: string;
    pharmacistName?: string;
    pharmacyName?: string;
  }) {
    const rx = this.prescriptions.find(p => p.id === rxIdOrCode || p.rxCode === rxIdOrCode);
    if (!rx) return;

    const pharmacistName = data.pharmacistName || this.currentUser?.fullName || 'الصيدلي المسؤول';
    const pharmacyName = data.pharmacyName || 'الصيدلية المعتمدة';

    rx.status = 'dispensed';
    rx.dispensedAt = new Date().toISOString();
    rx.dispensedByPharmacistName = pharmacistName;
    rx.dispensedByPharmacyName = pharmacyName;
    rx.dispensingBatchNumber = data.batchNumber;
    rx.dispensingNotes = data.notes;

    // Sync to Supabase
    supabaseService.updateDispensed(rx.rxCode, {
      pharmacistName,
      pharmacyName,
      batchNumber: data.batchNumber,
      notes: data.notes
    }).catch(err => console.warn('[Supabase Sync]', err));

    this.persistAll();
    this.notify();
  }

  // --- CLARIFICATIONS ---
  public getRequests(): PharmacistRequest[] {
    return this.requests;
  }

  public getRequestsForPrescription(rxId: string): PharmacistRequest[] {
    return this.requests.filter((r) => r.prescriptionId === rxId);
  }

  public createClarificationRequest(data: {
    prescriptionId: string;
    requestType: PharmacistRequest['requestType'];
    message: string;
  }): PharmacistRequest {
    const rx = this.getPrescriptionById(data.prescriptionId);
    const newReq: PharmacistRequest = {
      id: `req-${Date.now()}`,
      prescriptionId: rx?.id || data.prescriptionId,
      rxCode: rx?.rxCode || 'RX-0000',
      pharmacistId: this.currentUser?.id || 'ph-1',
      pharmacistName: this.currentUser?.fullName || 'الصيدلي',
      pharmacyName: 'صيدلية الرعاية',
      doctorId: rx?.doctorId || 'doc-1',
      doctorName: rx?.doctorName || 'الطبيب',
      patientName: rx?.patientName || 'المريض',
      requestType: data.requestType,
      message: data.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (rx) {
      rx.status = 'clarification';
    }

    this.requests.unshift(newReq);
    this.persistAll();
    this.notify();
    return newReq;
  }

  public answerClarificationRequest(requestId: string, responseMessage: string) {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return;

    req.doctorResponse = responseMessage;
    req.status = 'resolved';
    req.resolvedAt = new Date().toISOString();

    const rx = this.getPrescriptionById(req.prescriptionId);
    if (rx && rx.status === 'clarification') {
      rx.status = 'verified';
    }

    this.persistAll();
    this.notify();
  }

  // --- NOTIFICATIONS & AUDIT ---
  public getNotifications(role?: UserRole): Notification[] {
    return this.notifications;
  }

  public getUnreadNotificationCount(role?: UserRole): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persistAll();
      this.notify();
    }
  }

  public markAllNotificationsAsRead(role?: UserRole) {
    this.notifications.forEach((n) => { n.isRead = true; });
    this.persistAll();
    this.notify();
  }

  public getAuditLogs(prescriptionId?: string): AuditLog[] {
    return this.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    this.persistAll();
  }
}

export const rxStore = new RxStore();
