import { SupabaseClient } from '@supabase/supabase-js';
import { Prescription, MedicationItem } from '../App';
import { sanitizeInput, sanitizeAlphaNumeric, generateSecureQRPayload } from '../utils/security';

const STORAGE_KEY_RX = 'saferx_unified_prescriptions_v2';

export class PrescriptionService {
  public static getStoredPrescriptions(): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RX);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveStoredPrescriptions(list: Prescription[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_RX, JSON.stringify(list));
    } catch (e) {
      console.error('[PrescriptionService Save]', e);
    }
  }

  /**
   * Filter prescriptions strictly for the logged-in doctor.
   */
  public static filterForDoctor(prescriptions: Prescription[], userEmail: string, userFullName: string): Prescription[] {
    const cleanUserEmail = (userEmail || '').trim().toLowerCase();
    const cleanUserName = (userFullName || '').trim().toLowerCase();

    if (!cleanUserEmail && !cleanUserName) return [];

    return prescriptions.filter(p => {
      const docEmail = (p.doctorEmail || '').trim().toLowerCase();
      if (docEmail && cleanUserEmail) {
        return docEmail === cleanUserEmail;
      }
      const docName = (p.doctorName || '').trim().toLowerCase();
      if (docName && cleanUserName && docName !== 'د. الطبيب المعالج' && docName !== 'طبيب') {
        return docName === cleanUserName;
      }
      return false;
    });
  }

  /**
   * Create a new sanitized Prescription with integrity QR payload.
   */
  public static async createPrescription(
    data: {
      patientName: string;
      patientAge: string;
      patientPhone: string;
      allergies: string;
      diagnosis: string;
      notes: string;
      bp: string;
      hr: string;
      medications: MedicationItem[];
    },
    doctor: { email: string; fullName: string },
    supabase?: SupabaseClient | null
  ): Promise<Prescription> {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const rxCode = `RX-${randomChars}-${randomSuffix}`;
    const securityPin = Math.floor(1000 + Math.random() * 9000).toString();

    const sanitizedMeds: MedicationItem[] = (data.medications.length > 0 ? data.medications : [
      {
        id: `med-${Date.now()}`,
        name: 'علاج موصوف بالفحص السريري',
        dosage: 'جرعة قياسية',
        frequency: 'حسب إرشادات الطبيب',
        duration: 'حسب الحاجة',
        timing: 'after_meal',
        quantity: 1
      }
    ]).map(m => ({
      id: m.id || `med-${Date.now()}`,
      name: sanitizeInput(m.name),
      dosage: sanitizeInput(m.dosage),
      frequency: sanitizeInput(m.frequency),
      duration: sanitizeInput(m.duration),
      timing: sanitizeInput(m.timing),
      quantity: Number(m.quantity) || 1
    }));

    const cleanPatientName = sanitizeInput(data.patientName) || 'مريض (بدون اسم)';
    const cleanDoctorName = sanitizeInput(doctor.fullName) || 'د. الطبيب المعالج';
    const cleanDoctorEmail = (doctor.email || '').trim().toLowerCase();

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      rxCode,
      securityPin,
      qrCodeData: generateSecureQRPayload({
        code: rxCode,
        pin: securityPin,
        pat: cleanPatientName,
        doc: cleanDoctorName,
        date: new Date().toISOString().split('T')[0]
      }),
      doctorName: cleanDoctorName,
      doctorEmail: cleanDoctorEmail,
      doctorSpecialty: 'طبيب استشاري',
      patientName: cleanPatientName,
      patientNationalId: sanitizeAlphaNumeric(data.patientPhone),
      patientDob: sanitizeInput(data.patientAge),
      patientAllergies: data.allergies ? data.allergies.split(',').map(s => sanitizeInput(s)).filter(Boolean) : [],
      patientConditions: [],
      diagnosis: sanitizeInput(data.diagnosis) || 'كشف وفحص سريري عام',
      clinicalNotes: sanitizeInput(data.notes),
      vitals: {
        bp: sanitizeInput(data.bp),
        hr: sanitizeInput(data.hr)
      },
      medications: sanitizedMeds,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Save to Supabase
    if (supabase) {
      try {
        await supabase.from('prescriptions').upsert({
          rx_code: newRx.rxCode,
          security_pin: newRx.securityPin,
          doctor_name: newRx.doctorName,
          doctor_email: newRx.doctorEmail,
          patient_name: newRx.patientName,
          patient_national_id: newRx.patientNationalId,
          patient_dob: newRx.patientDob,
          patient_allergies: newRx.patientAllergies,
          diagnosis: newRx.diagnosis,
          clinical_notes: newRx.clinicalNotes,
          vitals: newRx.vitals,
          medications: newRx.medications,
          status: newRx.status,
          created_at: newRx.createdAt
        });
      } catch (err) {
        console.warn('[Supabase Sync Create]', err);
      }
    }

    return newRx;
  }

  /**
   * Update existing prescription safely.
   */
  public static async updatePrescription(
    existingRx: Prescription,
    data: {
      patientName: string;
      patientAge: string;
      patientPhone: string;
      allergies: string;
      diagnosis: string;
      notes: string;
      bp: string;
      hr: string;
      medications: MedicationItem[];
    },
    supabase?: SupabaseClient | null
  ): Promise<Prescription> {
    const updatedRx: Prescription = {
      ...existingRx,
      patientName: sanitizeInput(data.patientName) || existingRx.patientName,
      patientNationalId: sanitizeAlphaNumeric(data.patientPhone) || existingRx.patientNationalId,
      patientDob: sanitizeInput(data.patientAge) || existingRx.patientDob,
      patientAllergies: data.allergies ? data.allergies.split(',').map(s => sanitizeInput(s)).filter(Boolean) : [],
      diagnosis: sanitizeInput(data.diagnosis) || existingRx.diagnosis,
      clinicalNotes: sanitizeInput(data.notes),
      vitals: {
        bp: sanitizeInput(data.bp),
        hr: sanitizeInput(data.hr)
      },
      medications: data.medications.length > 0 ? data.medications.map(m => ({
        ...m,
        name: sanitizeInput(m.name),
        dosage: sanitizeInput(m.dosage),
        frequency: sanitizeInput(m.frequency)
      })) : existingRx.medications
    };

    if (supabase) {
      try {
        await supabase.from('prescriptions').update({
          patient_name: updatedRx.patientName,
          patient_national_id: updatedRx.patientNationalId,
          patient_dob: updatedRx.patientDob,
          patient_allergies: updatedRx.patientAllergies,
          diagnosis: updatedRx.diagnosis,
          clinical_notes: updatedRx.clinicalNotes,
          vitals: updatedRx.vitals,
          medications: updatedRx.medications
        }).eq('rx_code', updatedRx.rxCode);
      } catch (err) {
        console.warn('[Supabase Update]', err);
      }
    }

    return updatedRx;
  }

  /**
   * Delete prescription.
   */
  public static async deletePrescription(
    rxCode: string,
    supabase?: SupabaseClient | null
  ): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('prescriptions').delete().eq('rx_code', rxCode);
      } catch (err) {
        console.warn('[Supabase Delete]', err);
      }
    }
  }

  /**
   * Dispense prescription with pharmacist identity and batch tracking.
   */
  public static async dispensePrescription(
    rxCode: string,
    batchNumber: string,
    pharmacistName: string,
    supabase?: SupabaseClient | null
  ): Promise<{ dispensedAt: string; batch: string; pharmacist: string }> {
    const cleanBatch = sanitizeAlphaNumeric(batchNumber) || 'BATCH-VERIFIED';
    const cleanPharmacist = sanitizeInput(pharmacistName) || 'الصيدلي المسؤول';
    const now = new Date().toISOString();

    if (supabase) {
      try {
        await supabase.from('prescriptions').update({
          status: 'dispensed',
          dispensed_at: now,
          dispensed_by_pharmacist_name: cleanPharmacist,
          dispensing_batch_number: cleanBatch
        }).eq('rx_code', rxCode);
      } catch (err) {
        console.warn('[Supabase Dispense]', err);
      }
    }

    return {
      dispensedAt: now,
      batch: cleanBatch,
      pharmacist: cleanPharmacist
    };
  }
}
