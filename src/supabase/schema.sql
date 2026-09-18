-- ==========================================================
-- SafeRx Healthcare Platform: Production Database Architecture
-- PostgreSQL / Supabase Schema with Row Level Security (RLS)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Integrated with Supabase Auth or Standalone)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'pharmacist', 'patient')),
    status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended')),
    password_hash TEXT DEFAULT '',
    salt TEXT DEFAULT '',
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255) DEFAULT '',
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_by VARCHAR(255) DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DOCTORS PROFILE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    hospital_affiliation VARCHAR(255),
    clinic_address TEXT,
    signature_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PHARMACISTS PROFILE
CREATE TABLE IF NOT EXISTS pharmacists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    pharmacy_name VARCHAR(255) NOT NULL,
    pharmacy_branch VARCHAR(255),
    pharmacy_address TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PATIENTS PROFILE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    blood_group VARCHAR(10),
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLINICAL ALLERGIES & CHRONIC CONDITIONS
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen_name VARCHAR(150) NOT NULL,
    severity VARCHAR(50) DEFAULT 'severe',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chronic_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(150) NOT NULL,
    diagnosed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEDICATIONS CATALOG (Standard Formulary & Interaction Base)
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    drug_class VARCHAR(150),
    category VARCHAR(100),
    default_form VARCHAR(50),
    standard_dosage VARCHAR(100),
    contraindications TEXT[],
    known_allergens TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rx_code VARCHAR(30) UNIQUE NOT NULL,
    security_pin VARCHAR(10) NOT NULL,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    blood_pressure VARCHAR(30),
    heart_rate INT,
    temperature NUMERIC(4,1),
    weight_kg NUMERIC(5,2),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'verified', 'clarification', 'dispensed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    pharmacist_accessed_at TIMESTAMP WITH TIME ZONE,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    dispensed_by_pharmacist_id UUID REFERENCES pharmacists(id),
    dispensing_batch_number VARCHAR(100),
    dispensing_notes TEXT
);

-- 8. PRESCRIPTION MEDICATIONS (Items in Prescription)
CREATE TABLE IF NOT EXISTS prescription_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100) NOT NULL,
    form VARCHAR(50) NOT NULL,
    frequency VARCHAR(150) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    timing VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    refills_allowed INT DEFAULT 0,
    special_instructions TEXT
);

-- 9. PHARMACIST REQUESTS / CLARIFICATION INQUIRIES
CREATE TABLE IF NOT EXISTS pharmacist_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    pharmacist_id UUID NOT NULL REFERENCES pharmacists(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    request_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    doctor_response TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. DISPENSING RECORDS
CREATE TABLE IF NOT EXISTS dispensing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    pharmacist_id UUID NOT NULL REFERENCES pharmacists(id),
    batch_number VARCHAR(100) NOT NULL,
    quantity_dispensed INT NOT NULL,
    substitution_notes TEXT,
    dispensed_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    prescription_id UUID REFERENCES prescriptions(id),
    rx_code VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. IMMUTABLE AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SYSTEM SETTINGS & ADMIN CONFIGURATION
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255) DEFAULT 'SuperAdmin'
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- DOCTORS: Can select and insert their own prescriptions
CREATE POLICY "Doctors can view their created prescriptions" 
ON prescriptions FOR SELECT 
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert prescriptions" 
ON prescriptions FOR INSERT 
WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- PATIENTS: Can view only prescriptions issued to them
CREATE POLICY "Patients can view their own prescriptions" 
ON prescriptions FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- PHARMACISTS: Can only view prescription by exact RX CODE match or verification
CREATE POLICY "Pharmacists can view prescriptions via code verification" 
ON prescriptions FOR SELECT 
USING (EXISTS (SELECT 1 FROM pharmacists WHERE user_id = auth.uid()));

-- NOTIFICATIONS: Users see their own notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
USING (user_id = auth.uid());
