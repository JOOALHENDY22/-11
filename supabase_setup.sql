-- ================================================================
-- yoRosheta Smart Healthcare Platform - Complete Supabase Schema
-- تشغيل هذا الكود في Supabase SQL Editor لإنشاء وتهيئة كافة الجداول وخانة الأدمن بالكامل
-- ================================================================

-- تفعيل امتداد توليد المعرفات الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. جدول الحسابات والمستخدمين وخانة الأدمن (Profiles & Users Table)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('admin', 'doctor', 'pharmacist', 'patient')),
    status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended')),
    password_hash TEXT DEFAULT '',
    salt TEXT DEFAULT '',
    phone VARCHAR(100) DEFAULT '',
    license_number VARCHAR(100) DEFAULT '',
    specialty VARCHAR(255) DEFAULT '',
    organization_name VARCHAR(255) DEFAULT '',
    clinic_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(255) DEFAULT '',
    suspended_at TIMESTAMPTZ,
    suspended_by VARCHAR(255) DEFAULT '',
    last_login_at TIMESTAMPTZ
);

-- تحديث الأعمدة إذا كان الجدول موجوداً مسبقاً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'patient';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salt TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by VARCHAR(255) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- فهارس سريعة لجدول المستخدمين
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- إدراج حساب المشرف الرئيسي (SuperAdmin) تلقائياً
INSERT INTO public.profiles (email, full_name, role, status, password_hash, salt, created_at, approved_at)
VALUES (
    'jooalhendy@gmail.com',
    'مدير المنظومة (يوسف الهندي)',
    'admin',
    'approved',
    '56fc9a13fc19bcb03070d475286e31ac74381cab00510f4b5daf451b6f1ae890',
    'jooalhendy@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'approved',
    password_hash = '56fc9a13fc19bcb03070d475286e31ac74381cab00510f4b5daf451b6f1ae890',
    salt = 'jooalhendy@gmail.com';


-- ================================================================
-- 2. جدول الروشتات الطبية الذكية (Smart Prescriptions Table)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rx_code VARCHAR(50) UNIQUE NOT NULL,
    security_pin VARCHAR(10) DEFAULT '1234',
    doctor_name VARCHAR(255) DEFAULT 'طبيب معالج',
    doctor_email VARCHAR(255) DEFAULT '',
    doctor_specialty VARCHAR(255) DEFAULT 'طبيب استشاري',
    doctor_license VARCHAR(100) DEFAULT '',
    clinic_name VARCHAR(255) DEFAULT '',
    patient_name VARCHAR(255) DEFAULT 'مريض',
    patient_national_id VARCHAR(100) DEFAULT '',
    patient_dob VARCHAR(100) DEFAULT '',
    patient_gender VARCHAR(50) DEFAULT 'male',
    patient_allergies JSONB DEFAULT '[]'::jsonb,
    patient_conditions JSONB DEFAULT '[]'::jsonb,
    diagnosis TEXT DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    vitals JSONB DEFAULT '{}'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    safety_alerts JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'dispensed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    dispensed_at TIMESTAMPTZ,
    dispensed_by_pharmacist_name VARCHAR(255) DEFAULT '',
    dispensed_by_pharmacy_name VARCHAR(255) DEFAULT '',
    dispensing_batch_number VARCHAR(100) DEFAULT '',
    dispensing_notes TEXT DEFAULT ''
);

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_prescriptions_rx_code ON public.prescriptions(rx_code);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doc_email ON public.prescriptions(doctor_email);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pat_id ON public.prescriptions(patient_national_id);


-- ================================================================
-- 3. جدول سجل العمليات والرقابة الأمنية للأدمن (Admin & Security Audit Logs)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL, -- e.g. 'approve_user', 'suspend_user', 'delete_user', 'admin_login', 'dispense_rx'
    performed_by VARCHAR(255) NOT NULL DEFAULT 'System',
    target_email VARCHAR(255) DEFAULT '',
    target_role VARCHAR(50) DEFAULT '',
    target_rx_code VARCHAR(50) DEFAULT '',
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON public.security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON public.security_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.security_audit_logs(created_at);


-- ================================================================
-- 4. جدول إعدادات وضبط المنظومة (System Settings Table)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(255) DEFAULT 'SuperAdmin'
);

-- إدراج الإعدادات الافتراضية
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
    ('require_doctor_approval', 'true'::jsonb, 'اشتراط موافقة الأدمن على حسابات الأطباء الجدد'),
    ('require_pharmacist_approval', 'true'::jsonb, 'اشتراط موافقة الأدمن على حسابات الصيادلة الجدد'),
    ('auto_approve_patients', 'true'::jsonb, 'تفعيل حسابات المرضى فورياً بدون موافقة'),
    ('max_admin_login_attempts', '4'::jsonb, 'الحد الأقصى لمحاولات دخول الأدمن قبل الحظر المؤقت')
ON CONFLICT (setting_key) DO NOTHING;


-- ================================================================
-- 5. جدول الإشعارات والتنبيهات الحية (Notifications Table)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) DEFAULT 'info',
    rx_code VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_email);


-- ================================================================
-- 6. تفعيل أمان الصفوف (Row Level Security - RLS)
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Public Profiles Policy" ON public.profiles;
DROP POLICY IF EXISTS "Public Prescriptions Policy" ON public.prescriptions;
DROP POLICY IF EXISTS "Public Logs Policy" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Public Settings Policy" ON public.system_settings;
DROP POLICY IF EXISTS "Public Notifications Policy" ON public.notifications;

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow public read prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow public insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow public update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow public delete prescriptions" ON public.prescriptions;

-- سياسات Profiles
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profiles" ON public.profiles FOR DELETE USING (true);

-- سياسات Prescriptions
CREATE POLICY "Allow public read prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update prescriptions" ON public.prescriptions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete prescriptions" ON public.prescriptions FOR DELETE USING (true);

-- سياسات Audit Logs
CREATE POLICY "Allow public read logs" ON public.security_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert logs" ON public.security_audit_logs FOR INSERT WITH CHECK (true);

-- سياسات Settings
CREATE POLICY "Allow public read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON public.system_settings FOR UPDATE USING (true);

-- سياسات Notifications
CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON public.notifications FOR UPDATE USING (true);


-- ================================================================
-- 7. تفعيل التزامن اللحظي (Realtime Replication)
-- ================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.security_audit_logs;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

