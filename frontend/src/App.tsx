import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  User, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  LogOut, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  QrCode, 
  Activity, 
  Sparkles, 
  X, 
  Building, 
  Sun, 
  Moon, 
  Eye, 
  KeyRound,
  FileText,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Layers,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Shield,
  Zap,
  Heart
} from 'lucide-react';
import { AuthService, UserSession } from './services/authService';
import { PrescriptionService } from './services/prescriptionService';
import { SecurityRateLimiter, sanitizeInput, sanitizeAlphaNumeric, generatePrescriptionUrl, verifyQRData } from './utils/security';
import { translations, Language } from './utils/translations';
import { AdminDashboard } from './components/admin/AdminDashboard';

// ==========================================
// 1. SUPABASE CLIENT & BACKEND CONFIGURATION
// ==========================================
const metaEnv = (import.meta as any).env || {};
const storedUrl = typeof localStorage !== 'undefined' ? (localStorage.getItem('saferx_supabase_url') || '') : '';
const storedKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('saferx_supabase_anon_key') || '') : '';

const RAW_URL = storedUrl || metaEnv.VITE_SUPABASE_URL || '';
const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
const SUPABASE_ANON_KEY = (storedKey || metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

const isRealSupabase = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_URL.includes('.supabase.co') &&
  !SUPABASE_URL.includes('saferx-health-portal.supabase.co')
);

let supabaseClient: SupabaseClient | null = null;
if (isRealSupabase) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    supabaseClient = null;
  }
}

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
export type UserRole = 'admin' | 'doctor' | 'pharmacist' | 'patient';

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  rxCode: string;
  securityPin: string;
  qrCodeData: string;
  doctorName: string;
  doctorEmail?: string;
  doctorSpecialty: string;
  patientName: string;
  patientNationalId: string;
  patientDob: string;
  patientAllergies: string[];
  patientConditions: string[];
  diagnosis: string;
  clinicalNotes: string;
  vitals?: {
    bp?: string;
    hr?: string;
    weight?: string;
  };
  medications: MedicationItem[];
  status: 'active' | 'dispensed';
  createdAt: string;
  dispensedAt?: string;
  dispensedByPharmacistName?: string;
  dispensingBatchNumber?: string;
}

const STORAGE_KEY_THEME = 'yorosheta_theme';
const STORAGE_KEY_LANG = 'yorosheta_language';

// ==========================================
// CUSTOM TYPEWRITER HOOK
// ==========================================
function useTypewriter(text: string, speed = 35, startDelay = 150) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsDone(false);
    let index = 0;
    let timer: any = null;

    const delayTimeout = setTimeout(() => {
      timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsDone(true);
          clearInterval(timer);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(delayTimeout);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, startDelay]);

  return { displayText, isDone };
}

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
  });

  // Language state (persisted)
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as Language) || 'ar';
  });

  const t = translations[language];

  // Compact Salawat Notification with Typewriter effect & auto-dismiss
  const [salawatVisible, setSalawatVisible] = useState<boolean>(true);
  const [salawatExiting, setSalawatExiting] = useState<boolean>(false);
  const salawatType = useTypewriter('صلِّ على النبي ﷺ', 60, 250);

  useEffect(() => {
    if (salawatType.isDone) {
      const exitTimer = setTimeout(() => {
        setSalawatExiting(true);
        const unmountTimer = setTimeout(() => {
          setSalawatVisible(false);
        }, 700);
        return () => clearTimeout(unmountTimer);
      }, 2400);
      return () => clearTimeout(exitTimer);
    }
  }, [salawatType.isDone]);

  // Landing Page Typewriter effect
  const line1Type = useTypewriter(t.heroTitleLine1, 35, 150);
  const line2Type = useTypewriter(t.heroTitleLine2, 35, 1000);
  const descType = useTypewriter(t.heroDesc, 18, 2300);

  // Navigation & User State
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('saferx_active_role') as UserRole) || null;
  });
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return AuthService.getCurrentSession();
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    return PrescriptionService.getStoredPrescriptions();
  });

  // Modals & Navigation
  const [authRoleModal, setAuthRoleModal] = useState<UserRole | null>(null);
  const [isCreateRxOpen, setIsCreateRxOpen] = useState(false);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [justCreatedRx, setJustCreatedRx] = useState<Prescription | null>(null);
  const [selectedRxDetails, setSelectedRxDetails] = useState<Prescription | null>(null);

  // Doctor Filter & Search State
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState<'all' | 'active' | 'dispensed'>('all');

  // Helper to detect admin path case-insensitively
  const checkIsAdminURL = () => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      pathname === '/admin' ||
      pathname === '/admin/' ||
      pathname.endsWith('/admin') ||
      pathname.endsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.includes('admin') ||
      search.includes('admin')
    );
  };

  // Admin Route detection (from URL pathname, hash, or search)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminURL());

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdminURL());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Language & Direction effect
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language]);

  // Sync prescriptions to local store
  useEffect(() => {
    PrescriptionService.saveStoredPrescriptions(prescriptions);
  }, [prescriptions]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('saferx_active_role', currentRole);
    } else {
      localStorage.removeItem('saferx_active_role');
    }
  }, [currentRole]);

  useEffect(() => {
    AuthService.setCurrentSession(currentUser);
  }, [currentUser]);

  // Initial fetch from Supabase if online
  useEffect(() => {
    if (!supabaseClient) return;

    const fetchRemotePrescriptions = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('prescriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const remoteList: Prescription[] = data.map((d: any) => ({
            id: d.id,
            rxCode: d.rx_code,
            securityPin: d.security_pin || '1234',
            qrCodeData: generatePrescriptionUrl(d.rx_code, d.security_pin),
            doctorName: d.doctor_name || 'د. الطبيب المعالج',
            doctorEmail: d.doctor_email || '',
            doctorSpecialty: d.doctor_specialty || 'طبيب استشاري',
            patientName: d.patient_name || 'مريض',
            patientNationalId: d.patient_national_id || '',
            patientDob: d.patient_dob || '',
            patientAllergies: d.patient_allergies || [],
            patientConditions: d.patient_conditions || [],
            diagnosis: d.diagnosis || '',
            clinicalNotes: d.clinical_notes || '',
            vitals: d.vitals || {},
            medications: d.medications || [],
            status: d.status || 'active',
            createdAt: d.created_at || new Date().toISOString(),
            dispensedAt: d.dispensed_at,
            dispensedByPharmacistName: d.dispensed_by_pharmacist_name,
            dispensingBatchNumber: d.dispensing_batch_number
          }));

          setPrescriptions(prev => {
            const map = new Map<string, Prescription>();
            remoteList.forEach(p => map.set(p.rxCode, p));
            prev.forEach(p => {
              if (!map.has(p.rxCode)) map.set(p.rxCode, p);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('[Supabase Initial Fetch]', err);
      }
    };

    fetchRemotePrescriptions();
  }, []);

  // Automatically detect and open scanned Prescription QR Codes from URL (?rx=RX-CODE or ?code=RX-CODE or #rx=...)
  useEffect(() => {
    const handleUrlPrescriptionScan = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash || '';
        const hashMatch = hash.match(/[?&#](?:rx|code)=([^&#]+)/i);
        const hashParam = hashMatch ? decodeURIComponent(hashMatch[1]) : null;

        const rawParam = searchParams.get('rx') || searchParams.get('code') || hashParam;
        if (!rawParam) return;

        const clean = sanitizeAlphaNumeric(rawParam);
        if (!clean) return;

        // 1. Check in existing loaded prescriptions state
        let found = prescriptions.find(p => p.rxCode.toUpperCase() === clean);

        // 2. Check in local storage
        if (!found) {
          const stored = PrescriptionService.getStoredPrescriptions();
          found = stored.find(p => p.rxCode.toUpperCase() === clean);
        }

        // 3. Check in Supabase if online
        if (!found && supabaseClient) {
          try {
            const { data, error } = await supabaseClient
              .from('prescriptions')
              .select('*')
              .ilike('rx_code', clean)
              .maybeSingle();

            if (!error && data) {
              found = {
                id: data.id,
                rxCode: data.rx_code,
                securityPin: data.security_pin || '1234',
                qrCodeData: generatePrescriptionUrl(data.rx_code, data.security_pin),
                doctorName: data.doctor_name || 'د. الطبيب المعالج',
                doctorEmail: data.doctor_email || '',
                doctorSpecialty: data.doctor_specialty || 'طبيب استشاري',
                patientName: data.patient_name || 'مريض',
                patientNationalId: data.patient_national_id || '',
                patientDob: data.patient_dob || '',
                patientAllergies: data.patient_allergies || [],
                patientConditions: data.patient_conditions || [],
                diagnosis: data.diagnosis || '',
                clinicalNotes: data.clinical_notes || '',
                vitals: data.vitals || {},
                medications: data.medications || [],
                status: data.status || 'active',
                createdAt: data.created_at || new Date().toISOString(),
                dispensedAt: data.dispensed_at,
                dispensedByPharmacistName: data.dispensed_by_pharmacist_name,
                dispensingBatchNumber: data.dispensing_batch_number
              };
              setPrescriptions(prev => {
                if (prev.some(p => p.rxCode === found!.rxCode)) return prev;
                return [found!, ...prev];
              });
            }
          } catch (e) {
            console.warn('[QR Scan URL Fetch]', e);
          }
        }

        if (found) {
          setSelectedRxDetails(found);
        }
      } catch (err) {
        console.warn('[handleUrlPrescriptionScan]', err);
      }
    };

    handleUrlPrescriptionScan();
    window.addEventListener('popstate', handleUrlPrescriptionScan);
    window.addEventListener('hashchange', handleUrlPrescriptionScan);
    return () => {
      window.removeEventListener('popstate', handleUrlPrescriptionScan);
      window.removeEventListener('hashchange', handleUrlPrescriptionScan);
    };
  }, [prescriptions]);

  // --- ACTIONS ---
  const handleLogin = async (user: UserSession) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setAuthRoleModal(null);
  };

  const handleLogout = async () => {
    await AuthService.logout(supabaseClient);
    setCurrentUser(null);
    setCurrentRole(null);
  };

  // Create or Update Prescription
  const handleSavePrescription = async (data: {
    patientName: string;
    patientAge: string;
    patientPhone: string;
    allergies: string;
    diagnosis: string;
    notes: string;
    bp: string;
    hr: string;
    medications: MedicationItem[];
  }) => {
    if (editingRx) {
      const updatedRx = await PrescriptionService.updatePrescription(editingRx, data, supabaseClient);
      setPrescriptions(prev => prev.map(p => p.rxCode === editingRx.rxCode ? updatedRx : p));
      setIsCreateRxOpen(false);
      setEditingRx(null);
      return;
    }

    // Create New Prescription
    const newRx = await PrescriptionService.createPrescription(
      data,
      { email: currentUser?.email || '', fullName: currentUser?.fullName || '' },
      supabaseClient
    );

    setPrescriptions(prev => [newRx, ...prev]);

    try {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch {}

    setIsCreateRxOpen(false);
    setJustCreatedRx(newRx);
  };

  // Delete Prescription (Doctor only)
  const handleDeletePrescription = async (rxCode: string) => {
    if (window.confirm(t.deleteConfirmMsg)) {
      setPrescriptions(prev => prev.filter(p => p.rxCode !== rxCode));
      await PrescriptionService.deletePrescription(rxCode, supabaseClient);
    }
  };

  const handleDispense = async (rxCode: string, batchNumber: string) => {
    const result = await PrescriptionService.dispensePrescription(
      rxCode,
      batchNumber,
      currentUser?.fullName || (language === 'ar' ? 'الصيدلي المسؤول' : 'Pharmacist in Charge'),
      supabaseClient
    );

    setPrescriptions(prev => prev.map(p => {
      if (p.rxCode === rxCode || p.id === rxCode) {
        return {
          ...p,
          status: 'dispensed',
          dispensedAt: result.dispensedAt,
          dispensedByPharmacistName: result.pharmacist,
          dispensingBatchNumber: result.batch
        };
      }
      return p;
    }));

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  // Filter Doctor Prescriptions (Show ONLY prescriptions created by THIS specific doctor)
  const doctorPrescriptions = useMemo(() => {
    if (!currentUser) return [];
    return PrescriptionService.filterForDoctor(prescriptions, currentUser.email, currentUser.fullName);
  }, [prescriptions, currentUser]);

  // Filtered doctor list based on search & status
  const filteredDoctorPrescriptions = useMemo(() => {
    return doctorPrescriptions.filter(rx => {
      const matchQuery = 
        !doctorSearchQuery.trim() ||
        rx.patientName.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
        rx.rxCode.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
        (rx.diagnosis && rx.diagnosis.toLowerCase().includes(doctorSearchQuery.toLowerCase())) ||
        (rx.patientNationalId && rx.patientNationalId.includes(doctorSearchQuery));
      
      const matchStatus = 
        doctorStatusFilter === 'all' || 
        rx.status === doctorStatusFilter;

      return matchQuery && matchStatus;
    });
  }, [doctorPrescriptions, doctorSearchQuery, doctorStatusFilter]);

  // Statistics for doctor dashboard
  const stats = useMemo(() => {
    const total = doctorPrescriptions.length;
    const active = doctorPrescriptions.filter(p => p.status === 'active').length;
    const dispensed = doctorPrescriptions.filter(p => p.status === 'dispensed').length;
    const totalMeds = doctorPrescriptions.reduce((acc, p) => acc + (p.medications?.length || 0), 0);
    return { total, active, dispensed, totalMeds };
  }, [doctorPrescriptions]);

  // If on /admin route or logged in as admin, render dedicated Admin Control Panel
  if (isAdminRoute || currentRole === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onAdminLogin={(user) => {
          setCurrentUser(user);
          setCurrentRole('admin');
        }}
        onAdminLogout={async () => {
          await AuthService.logout(supabaseClient);
          setCurrentUser(null);
          setCurrentRole(null);
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
          if (currentUser?.role === 'admin') {
            setCurrentRole(null);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
        language={language}
        onToggleLanguage={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
        totalPrescriptionsCount={prescriptions.length}
        supabaseClient={supabaseClient}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* ========================================== */}
      {/* COMPACT BORDERLESS BLUR SALAWAT TOAST      */}
      {/* ========================================== */}
      {salawatVisible && (
        <div
          className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out transform ${
            salawatExiting
              ? 'opacity-0 -translate-y-6 scale-90 pointer-events-none'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <div className="relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-950/60 dark:bg-black/60 text-white backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none">
            {/* Ambient Pulse Indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </span>

            {/* Typewriter Text */}
            <span className="text-xs sm:text-sm font-bold text-emerald-300 tracking-wide font-arabic">
              {salawatType.displayText}
              {!salawatType.isDone && (
                <span className="animate-typewriter-cursor text-emerald-400 font-normal">|</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* HEADER NAVBAR                              */}
      {/* ========================================== */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${isDarkMode ? 'bg-[#090d16]/90 border-slate-800/80 shadow-sm' : 'bg-white/90 border-slate-200/80 shadow-xs'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => setCurrentRole(null)}
            className="flex items-center gap-3 text-start focus:outline-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  yo<span className="text-teal-600 dark:text-teal-400">Rosheta</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  {t.healthPortal}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal -mt-0.5 hidden sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!currentRole ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setAuthRoleModal('doctor')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t.doctorEntry}</span>
                </button>
                <button
                  onClick={() => setAuthRoleModal('pharmacist')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
                >
                  <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t.pharmacistEntry}</span>
                </button>
                <button
                  onClick={() => setAuthRoleModal('patient')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t.patientEntry}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2.5 bg-slate-100/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-3 py-1.5 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-start hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                      {currentUser?.fullName || t.userFallback}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block leading-tight">
                      {currentUser?.email || ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    {currentRole === 'doctor' && t.doctorRoleBadge}
                    {currentRole === 'pharmacist' && t.pharmaRoleBadge}
                    {currentRole === 'patient' && t.patientRoleBadge}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t.logoutTooltip}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center"
              title={isDarkMode ? t.toggleLight : t.toggleDark}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>{t.langToggle}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN VIEW CONTROLLER                       */}
      {/* ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!currentRole ? (
          /* ========================================== */
          /* 1. LANDING PAGE                            */
          /* ========================================== */
          <div className="space-y-16 text-center">
            {/* Hero Section */}
            <div className="relative max-w-3xl mx-auto space-y-6 pt-4">
              {/* Luxury Ambient Glow Aura */}
              <div className="pointer-events-none absolute -top-16 left-1/2 w-[340px] sm:w-[560px] h-[260px] bg-gradient-to-tr from-teal-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl animate-ambient-glow -z-10" />

              <div className="animate-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800 dark:text-teal-300 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600/20" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.25]">
                <span className={`block animate-hero-title-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {line1Type.displayText}
                  {!line1Type.isDone && (
                    <span className="animate-typewriter-cursor text-teal-500">|</span>
                  )}
                </span>
                <span className="block animate-hero-title-2 lux-gradient-text mt-1.5 min-h-[1.3em]">
                  {line2Type.displayText}
                  {line1Type.isDone && !line2Type.isDone && (
                    <span className="animate-typewriter-cursor text-teal-400">|</span>
                  )}
                </span>
              </h1>

              <p className="animate-hero-desc text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal min-h-[4rem]">
                {descType.displayText}
                {line2Type.isDone && !descType.isDone && (
                  <span className="animate-typewriter-cursor text-teal-600/70">|</span>
                )}
              </p>
            </div>

            {/* 3 Dedicated Role Cards */}
            <div className="animate-hero-cards max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
              {/* Card 1: Doctor */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-teal-500/30 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-13 h-13 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">{t.doctorCardTag}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{t.doctorCardTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {t.doctorCardDesc}
                  </p>
                </div>
                <button
                  onClick={() => setAuthRoleModal('doctor')}
                  className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{t.doctorCardBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* Card 2: Pharmacist */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-teal-500/30 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-13 h-13 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">{t.pharmaCardTag}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{t.pharmaCardTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {t.pharmaCardDesc}
                  </p>
                </div>
                <button
                  onClick={() => setAuthRoleModal('pharmacist')}
                  className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{t.pharmaCardBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* Card 3: Patient */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-teal-500/30 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-13 h-13 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">{t.patientCardTag}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{t.patientCardTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {t.patientCardDesc}
                  </p>
                </div>
                <button
                  onClick={() => setAuthRoleModal('patient')}
                  className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{t.patientCardBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-4xl mx-auto pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-teal-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold block text-slate-900 dark:text-white">{t.trustEncTitle}</span>
                <span className="text-[11px] text-slate-400">{t.trustEncDesc}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <Lock className="w-5 h-5 text-teal-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold block text-slate-900 dark:text-white">{t.trustIsoTitle}</span>
                <span className="text-[11px] text-slate-400">{t.trustIsoDesc}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <QrCode className="w-5 h-5 text-teal-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold block text-slate-900 dark:text-white">{t.trustQrTitle}</span>
                <span className="text-[11px] text-slate-400">{t.trustQrDesc}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <HeartPulse className="w-5 h-5 text-teal-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold block text-slate-900 dark:text-white">{t.trustHealthTitle}</span>
                <span className="text-[11px] text-slate-400">{t.trustHealthDesc}</span>
              </div>
            </div>

            {/* Landing Page Footer */}
            <footer className="pt-8 pb-4 text-center border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 max-w-4xl mx-auto">
                <div>
                  © 2026 yoRosheta. {language === 'ar' ? 'جميع الحقوق محفوظة للمنظومة الطبية الموحدة.' : 'All rights reserved.'}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{language === 'ar' ? 'منظومة مشفرة ومعتمدة' : 'Encrypted & Certified System'}</span>
                </div>
              </div>
            </footer>
          </div>
        ) : currentRole === 'doctor' ? (
          /* ========================================== */
          /* 2. DOCTOR WORKSPACE                        */
          /* ========================================== */
          <div className="space-y-8 animate-fade-in text-start">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t.docPortalTitle}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentUser?.fullName || t.docFallbackName}
                  </h1>
                  <p className="text-xs text-slate-300 max-w-xl font-normal">
                    {currentUser?.email ? `${t.docEmailPrefix} ${currentUser.email} • ${t.docPortalSubtitle}` : t.docPortalSubtitle}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => { setEditingRx(null); setIsCreateRxOpen(true); }}
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.docAddRxBtn}</span>
                </button>
              </div>
            </div>

            {/* Stats Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.statTotalRx}</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
                  {stats.total}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{t.statTotalRxSub}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.statActiveRx}</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-mono">
                  {stats.active}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{t.statActiveRxSub}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.statDispensedRx}</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                  {stats.dispensed}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{t.statDispensedRxSub}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.statTotalMeds}</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2 font-mono">
                  {stats.totalMeds}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{t.statTotalMedsSub}</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={() => setDoctorStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    doctorStatusFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.filterAll} ({doctorPrescriptions.length})
                </button>
                <button
                  onClick={() => setDoctorStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    doctorStatusFilter === 'active'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.filterActive} ({stats.active})
                </button>
                <button
                  onClick={() => setDoctorStatusFilter('dispensed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    doctorStatusFilter === 'dispensed'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.filterDispensed} ({stats.dispensed})
                </button>
              </div>
            </div>

            {/* Prescriptions Grid */}
            <div className="space-y-4">
              {filteredDoctorPrescriptions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200/90 dark:border-slate-800 text-center space-y-4 shadow-card">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {doctorSearchQuery ? t.emptySearchTitle : t.emptyNoRxTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-normal">
                    {doctorSearchQuery ? t.emptySearchDesc : t.emptyNoRxDesc}
                  </p>
                  {!doctorSearchQuery && (
                    <button
                      onClick={() => { setEditingRx(null); setIsCreateRxOpen(true); }}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.emptyAddBtn}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDoctorPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-teal-500/30 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 px-2.5 py-1 rounded-xl">
                              {rx.rxCode}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(rx.rxCode);
                              }}
                              className="text-slate-400 hover:text-teal-600 p-1"
                              title={t.copyTooltip}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            rx.status === 'dispensed' 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                          }`}>
                            {rx.status === 'dispensed' ? t.statusDispensed : t.statusActive}
                          </span>
                        </div>

                        {/* Patient & Diagnosis */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-teal-600" />
                              <span>{rx.patientName}</span>
                            </h4>
                            {rx.patientDob && (
                              <span className="text-[11px] text-slate-400">{t.patientAgeLabel} {rx.patientDob}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 font-normal">
                            <strong className="text-slate-400 font-semibold">{t.diagnosisLabel}</strong> {rx.diagnosis || t.diagnosisFallback}
                          </p>
                        </div>

                        {/* Vitals Pills */}
                        {rx.vitals && (rx.vitals.bp || rx.vitals.hr) && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                            <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {rx.vitals.bp && <span>{t.bpLabel} {rx.vitals.bp}</span>}
                            {rx.vitals.bp && rx.vitals.hr && <span>•</span>}
                            {rx.vitals.hr && <span>{t.hrLabel} {rx.vitals.hr}</span>}
                          </div>
                        )}

                        {/* Allergies Alert */}
                        {rx.patientAllergies && rx.patientAllergies.length > 0 && (
                          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-[11px] flex items-center gap-1.5 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>{t.allergyLabel} {rx.patientAllergies.join(', ')}</span>
                          </div>
                        )}

                        {/* Med count */}
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center justify-between">
                          <span className="font-semibold">{rx.medications.length} {t.medsCountLabel}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{rx.createdAt.split('T')[0]}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedRxDetails(rx)}
                          className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>{t.btnView}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setEditingRx(rx); setIsCreateRxOpen(true); }}
                          className="py-2 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{t.btnEdit}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePrescription(rx.rxCode)}
                          className="py-2 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.btnDelete}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : currentRole === 'pharmacist' ? (
          /* ========================================== */
          /* 3. PHARMACIST WORKSPACE                    */
          /* ========================================== */
          <PharmacistStation
            prescriptions={prescriptions}
            onDispense={handleDispense}
            isDarkMode={isDarkMode}
            language={language}
          />
        ) : (
          /* ========================================== */
          /* 4. PATIENT WORKSPACE                       */
          /* ========================================== */
          <PatientStation prescriptions={prescriptions} isDarkMode={isDarkMode} language={language} />
        )}
      </main>

      {/* ========================================== */}
      {/* ROLE AUTH MODAL (SIGN IN / SIGN UP)        */}
      {/* ========================================== */}
      {authRoleModal && (
        <AuthModalComponent
          role={authRoleModal}
          isOpen={!!authRoleModal}
          onClose={() => setAuthRoleModal(null)}
          onSuccess={handleLogin}
          isDarkMode={isDarkMode}
          language={language}
        />
      )}

      {/* ========================================== */}
      {/* CREATE / EDIT PRESCRIPTION MODAL (DOCTOR)  */}
      {/* ========================================== */}
      {isCreateRxOpen && (
        <CreateRxModalComponent
          isOpen={isCreateRxOpen}
          initialData={editingRx}
          onClose={() => { setIsCreateRxOpen(false); setEditingRx(null); }}
          onSave={handleSavePrescription}
          isDarkMode={isDarkMode}
          language={language}
        />
      )}

      {/* ========================================== */}
      {/* SUCCESS CELEBRATION MODAL WITH PATIENT CODE */}
      {/* ========================================== */}
      {justCreatedRx && (
        <SuccessRxModalComponent
          prescription={justCreatedRx}
          isOpen={!!justCreatedRx}
          onClose={() => setJustCreatedRx(null)}
          onViewDetails={(rx) => {
            setJustCreatedRx(null);
            setSelectedRxDetails(rx);
          }}
          isDarkMode={isDarkMode}
          language={language}
        />
      )}

      {/* ========================================== */}
      {/* RX DETAILS MODAL                           */}
      {/* ========================================== */}
      {selectedRxDetails && (
        <RxDetailsModalComponent
          prescription={selectedRxDetails}
          isOpen={!!selectedRxDetails}
          onClose={() => setSelectedRxDetails(null)}
          isDarkMode={isDarkMode}
          language={language}
        />
      )}
    </div>
  );
};

// ==========================================
// 5. PHARMACIST STATION COMPONENT
// ==========================================
const PharmacistStation: React.FC<{
  prescriptions: Prescription[];
  onDispense: (rxCode: string, batchNumber: string) => void;
  isDarkMode: boolean;
  language: Language;
}> = ({ prescriptions, onDispense, isDarkMode, language }) => {
  const t = translations[language];
  const [rxCodeInput, setRxCodeInput] = useState('');
  const [searchedRx, setSearchedRx] = useState<Prescription | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [batchInput, setBatchInput] = useState(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const raw = (rxCodeInput || '').trim();
    const verified = verifyQRData(raw);
    const clean = verified.valid && verified.data?.code 
      ? verified.data.code 
      : sanitizeAlphaNumeric(raw);

    if (!clean) {
      setErrorMessage(t.pharmaErrorEnterCode);
      return;
    }

    const rateCheck = SecurityRateLimiter.checkLimit('pharma_search', 10, 60);
    if (!rateCheck.allowed) {
      setErrorMessage(t.pharmaErrorRateLimit.replace('{sec}', String(rateCheck.remainingSeconds)));
      return;
    }

    const found = prescriptions.find(p => p.rxCode.toUpperCase() === clean);
    if (!found) {
      SecurityRateLimiter.recordFailedAttempt('pharma_search', 10, 60);
      setErrorMessage(t.pharmaErrorNotFound.replace('{code}', clean));
      setSearchedRx(null);
      return;
    }
    SecurityRateLimiter.reset('pharma_search');
    setSearchedRx(found);
  };

  const handleConfirmDispense = () => {
    if (!searchedRx) return;
    onDispense(searchedRx.rxCode, batchInput);
    setSearchedRx(prev => prev ? { ...prev, status: 'dispensed' } : null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-start">
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
          <Pill className="w-3.5 h-3.5" />
          <span>{t.pharmaBannerTag}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{t.pharmaBannerTitle}</h1>
        <p className="text-xs text-slate-300 mt-1 font-normal">
          {t.pharmaBannerDesc}
        </p>
      </div>

      {/* Code Search Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          <span>{t.pharmaSearchTitle}</span>
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={rxCodeInput}
              onChange={(e) => { setRxCodeInput(e.target.value); if (errorMessage) setErrorMessage(null); }}
              placeholder={t.pharmaSearchPlaceholder}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t.pharmaSearchBtn}</span>
          </button>
        </form>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Prescription Result Display */}
      {searchedRx && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-card space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black text-teal-700 dark:text-teal-400">{searchedRx.rxCode}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  searchedRx.status === 'dispensed' 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}>
                  {searchedRx.status === 'dispensed' ? t.pharmaAlreadyDispensed : t.pharmaReadyToDispense}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.pharmaCreatedAt} {searchedRx.createdAt.split('T')[0]}</p>
            </div>
            <div className="text-start text-xs">
              <span className="text-slate-400 block">{t.pharmaDoctor}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{searchedRx.doctorName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div><strong className="text-slate-400 font-semibold">{t.pharmaPatient} </strong> <span className="text-slate-900 dark:text-white font-bold">{searchedRx.patientName}</span></div>
            <div><strong className="text-slate-400 font-semibold">{t.pharmaDiagnosis} </strong> <span className="text-slate-900 dark:text-white font-bold">{searchedRx.diagnosis || t.diagnosisFallback}</span></div>
          </div>

          {/* Allergies Warning */}
          {searchedRx.patientAllergies && searchedRx.patientAllergies.length > 0 && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span><strong>{t.pharmaAllergiesAlert}</strong> {searchedRx.patientAllergies.join(', ')}</span>
            </div>
          )}

          {/* Medications list */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.pharmaMedsListTitle}</h4>
            <div className="space-y-2">
              {searchedRx.medications.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{m.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">{m.dosage} • {m.frequency} • {m.duration}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold">
                    {m.quantity} {t.pharmaPackCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dispense action */}
          {searchedRx.status !== 'dispensed' ? (
            <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-4">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-300 block">{t.pharmaDispenseBoxTitle}</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={t.pharmaBatchPlaceholder}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white flex-1 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleConfirmDispense}
                  className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.pharmaConfirmDispenseBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.pharmaDispensedSuccess}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. PATIENT STATION COMPONENT
// ==========================================
const PatientStation: React.FC<{
  prescriptions: Prescription[];
  isDarkMode: boolean;
  language: Language;
}> = ({ prescriptions, isDarkMode, language }) => {
  const t = translations[language];
  const [rxCodeInput, setRxCodeInput] = useState('');
  const [searchedRx, setSearchedRx] = useState<Prescription | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const raw = (rxCodeInput || '').trim();
    const verified = verifyQRData(raw);
    const clean = verified.valid && verified.data?.code 
      ? verified.data.code 
      : sanitizeAlphaNumeric(raw);

    if (!clean) {
      setErrorMessage(t.pharmaErrorEnterCode);
      return;
    }

    const rateCheck = SecurityRateLimiter.checkLimit('patient_search', 10, 60);
    if (!rateCheck.allowed) {
      setErrorMessage(t.pharmaErrorRateLimit.replace('{sec}', String(rateCheck.remainingSeconds)));
      return;
    }

    const found = prescriptions.find(p => p.rxCode.toUpperCase() === clean);
    if (!found) {
      SecurityRateLimiter.recordFailedAttempt('patient_search', 10, 60);
      setErrorMessage(t.pharmaErrorNotFound.replace('{code}', clean));
      setSearchedRx(null);
      return;
    }
    SecurityRateLimiter.reset('patient_search');
    setSearchedRx(found);
  };

  const getTimingLabel = (timing: string) => {
    switch (timing) {
      case 'after_meal': return t.timingAfterMeal;
      case 'before_meal': return t.timingBeforeMeal;
      case 'with_meal': return t.timingWithMeal;
      case 'bedtime': return t.timingBedtime;
      default: return t.timingDefault;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-start">
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>{t.patientBannerTag}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{t.patientBannerTitle}</h1>
        <p className="text-xs text-slate-300 mt-1 font-normal">
          {t.patientBannerDesc}
        </p>
      </div>

      {/* Code Search Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          <span>{t.patientSearchTitle}</span>
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={rxCodeInput}
            onChange={(e) => { setRxCodeInput(e.target.value); if (errorMessage) setErrorMessage(null); }}
            placeholder={t.pharmaSearchPlaceholder}
            className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t.patientSearchBtn}</span>
          </button>
        </form>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Prescription Patient Card */}
      {searchedRx && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-card space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-teal-500/10 border border-teal-500/20">
            <div className="space-y-1 text-center sm:text-start">
              <span className="text-xs text-teal-800 dark:text-teal-300 font-semibold block">{t.patientVerifiedCode}</span>
              <span className="font-mono text-3xl font-black text-slate-900 dark:text-white block">{searchedRx.rxCode}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.patientDoctorLabel} {searchedRx.doctorName}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <QRCodeSVG value={searchedRx.qrCodeData} size={120} />
            </div>
          </div>

          {/* Medications list */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.patientScheduleTitle}</h4>
            <div className="space-y-2">
              {searchedRx.medications.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{m.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">{m.dosage} • {m.frequency} • {m.duration}</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold text-xs">
                    {getTimingLabel(m.timing)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => window.print()}
              className="py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.patientPrintBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. AUTH MODAL COMPONENT (SIGN IN & SIGN UP)
// ==========================================
const AuthModalComponent: React.FC<{
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession) => void;
  isDarkMode: boolean;
  language: Language;
}> = ({ role, isOpen, onClose, onSuccess, isDarkMode, language }) => {
  const t = translations[language];
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roleTitle = role === 'doctor' ? t.authTitleDoctor : role === 'pharmacist' ? t.authTitlePharmacist : t.authTitlePatient;
  const namePlaceholder = role === 'doctor' ? t.authFullNamePlaceholderDoc : role === 'pharmacist' ? t.authFullNamePlaceholderPharma : t.authFullNamePlaceholderPat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);
    setLoading(true);

    if (isSignUp) {
      const result = await AuthService.register(name, email, password, role, supabaseClient);
      if (result.success) {
        if (result.pendingApproval) {
          setPendingNotice(
            result.message ||
            (language === 'ar'
              ? 'تم تسجيل حسابك بنجاح! حسابك قيد مراجعة واعتماد إدارة yoRosheta لضمان التراخيص الطبية. ستتمكن من تسجيل الدخول فور الموافقة.'
              : 'Registered successfully! Awaiting Admin Approval.')
          );
        } else if (result.user) {
          onSuccess(result.user);
        }
      } else {
        setErrorMessage(result.error || t.authErrorRegisterFail);
      }
    } else {
      const result = await AuthService.login(email, password, role, supabaseClient);
      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setErrorMessage(result.error || t.authErrorLoginFail);
      }
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in text-start">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
              {role === 'doctor' && <Stethoscope className="w-5 h-5" />}
              {role === 'pharmacist' && <Pill className="w-5 h-5" />}
              {role === 'patient' && <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.authPortalPrefix} {roleTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                {isSignUp ? t.authSignUpSubtitle : t.authSignInSubtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Approval Notice Screen */}
        {pendingNotice ? (
          <div className="space-y-4 text-center py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'ar' ? 'طلبك قيد المراجعة والاعتماد' : 'Application Under Review'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
              {pendingNotice}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              {language === 'ar' ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  !isSignUp
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.authTabSignIn}
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isSignUp
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.authTabSignUp}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in font-normal">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.authFullNameLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required={isSignUp}
                value={name}
                onChange={(e) => { setName(e.target.value); if (errorMessage) setErrorMessage(''); }}
                placeholder={namePlaceholder}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.authEmailLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errorMessage) setErrorMessage(''); }}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-mono text-left ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.authPasswordLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errorMessage) setErrorMessage(''); }}
              placeholder={t.authPasswordPlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-left ltr font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>{t.authBtnProcessing}</span>
            ) : isSignUp ? (
              <span>{t.authBtnSignUp}</span>
            ) : (
              <span>{t.authBtnSignIn}</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          {isSignUp ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t.authAlreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {t.authTabSignIn}
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t.authFirstTimeAccount}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {t.authTabSignUp}
              </button>
            </p>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 8. CREATE / EDIT RX MODAL WITH QUICK CHIPS
// ==========================================
const COMMON_MED_PRESETS = [
  { name: 'Panadol Extra', dosage: '500mg', frequencyKey: 'freqPrn', timing: 'after_meal' },
  { name: 'Augmentin', dosage: '1g', frequencyKey: 'freqTwice', timing: 'after_meal' },
  { name: 'Concor', dosage: '5mg', frequencyKey: 'freqOnce', timing: 'before_meal' },
  { name: 'Cataflam', dosage: '50mg', frequencyKey: 'freqTwice', timing: 'after_meal' },
  { name: 'Antinal', dosage: '200mg', frequencyKey: 'freqThree', timing: 'after_meal' },
  { name: 'Controloc', dosage: '40mg', frequencyKey: 'freqOnce', timing: 'before_meal' }
];

const CreateRxModalComponent: React.FC<{
  isOpen: boolean;
  initialData?: Prescription | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isDarkMode: boolean;
  language: Language;
}> = ({ isOpen, initialData, onClose, onSave, isDarkMode, language }) => {
  const t = translations[language];

  const QUICK_FREQUENCIES = [
    { label: t.freqOnce, value: t.freqOnce },
    { label: t.freqTwice, value: t.freqTwice },
    { label: t.freqThree, value: t.freqThree },
    { label: t.freqFour, value: t.freqFour },
    { label: t.freqPrn, value: t.freqPrn }
  ];

  const QUICK_TIMINGS = [
    { label: t.timingAfterMeal, value: 'after_meal' },
    { label: t.timingBeforeMeal, value: 'before_meal' },
    { label: t.timingWithMeal, value: 'with_meal' },
    { label: t.timingBedtime, value: 'bedtime' }
  ];

  const [patientName, setPatientName] = useState(initialData?.patientName || '');
  const [patientAge, setPatientAge] = useState(initialData?.patientDob || '');
  const [patientPhone, setPatientPhone] = useState(initialData?.patientNationalId || '');
  const [allergies, setAllergies] = useState(initialData?.patientAllergies?.join(', ') || '');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
  const [notes, setNotes] = useState(initialData?.clinicalNotes || '');
  const [bp, setBp] = useState(initialData?.vitals?.bp || '');
  const [hr, setHr] = useState(initialData?.vitals?.hr || '');
  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    if (initialData?.medications && initialData.medications.length > 0) {
      return initialData.medications;
    }
    return [
      {
        id: `med-1`,
        name: '',
        dosage: '',
        frequency: t.freqOnce,
        duration: t.dur7Days,
        timing: 'after_meal',
        quantity: 1
      }
    ];
  });

  if (!isOpen) return null;

  const handleAddMed = (preset?: { name: string; dosage: string; frequencyKey: string; timing: string }) => {
    const freq = preset ? (t as any)[preset.frequencyKey] : t.freqTwice;
    setMedications(prev => [
      ...prev,
      {
        id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: preset?.name || '',
        dosage: preset?.dosage || '',
        frequency: freq,
        duration: t.dur7Days,
        timing: preset?.timing || 'after_meal',
        quantity: 1
      }
    ]);
  };

  const handleUpdateMed = (index: number, field: keyof MedicationItem, value: any) => {
    setMedications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveMed = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = medications.filter(m => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      alert(t.modalAlertAddAtLeastOne);
      return;
    }
    onSave({
      patientName,
      patientAge,
      patientPhone,
      allergies,
      diagnosis,
      notes,
      bp,
      hr,
      medications: validMeds
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in text-start overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 my-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>{initialData ? t.modalEditRxTitle.replace('{code}', initialData.rxCode) : t.modalNewRxTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              {t.modalRxSubtitle}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>{t.modalSecPatient}</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder={t.modalPatientNamePlaceholder}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder={t.modalPatientAgePlaceholder}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder={t.modalPatientPhonePlaceholder}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder={t.modalAllergiesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-300 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Clinical Info & Vitals */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>{t.modalSecClinical}</span>
            </span>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder={t.modalDiagnosisPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder={t.modalBpPlaceholder}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder={t.modalHrPlaceholder}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">{t.modalQuickPresets}</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MED_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddMed(preset)}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-[11px] font-semibold border border-teal-500/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Medications Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{t.modalSecMeds}</span>
            </span>
            <div className="space-y-3">
              {medications.map((m, idx) => (
                <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{t.modalMedItemHeader.replace('{idx}', String(idx + 1))}</span>
                    {medications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMed(idx)} 
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={m.name}
                      onChange={(e) => handleUpdateMed(idx, 'name', e.target.value)}
                      placeholder={t.modalMedNamePlaceholder}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={m.dosage}
                      onChange={(e) => handleUpdateMed(idx, 'dosage', e.target.value)}
                      placeholder={t.modalMedDosagePlaceholder}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={m.frequency}
                      onChange={(e) => handleUpdateMed(idx, 'frequency', e.target.value)}
                      placeholder={t.modalMedFreqPlaceholder}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Frequency Quick Chips */}
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-slate-400 me-1">{t.modalQuickFreqLabel}</span>
                    {QUICK_FREQUENCIES.map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => handleUpdateMed(idx, 'frequency', freq.value)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          m.frequency === freq.value
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>

                  {/* Timing & Quantity Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 shrink-0">{t.modalTimingLabel}</span>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_TIMINGS.map((tim) => (
                          <button
                            key={tim.value}
                            type="button"
                            onClick={() => handleUpdateMed(idx, 'timing', tim.value)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                              m.timing === tim.value
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {tim.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-slate-400">{t.modalQtyLabel}</span>
                      <input
                        type="number"
                        min="1"
                        value={m.quantity || 1}
                        onChange={(e) => handleUpdateMed(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-center text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">{t.modalPackSuffix}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddMed()}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-teal-500/5 transition-colors"
              >
                <Plus className="w-4 h-4 text-teal-600" />
                <span>{t.modalAddAnotherMed}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {t.modalBtnCancel}
            </button>
            <button type="submit" className="px-7 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors">
              {initialData ? t.modalBtnSaveEdit : t.modalBtnSaveNew}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 9. CELEBRATION MODAL WITH RX CODE & QR
// ==========================================
const SuccessRxModalComponent: React.FC<{
  prescription: Prescription;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (rx: Prescription) => void;
  isDarkMode: boolean;
  language: Language;
}> = ({ prescription, isOpen, onClose, onViewDetails, isDarkMode, language }) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prescription.rxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in text-center">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-slide-up">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.successTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">{t.successSubtitle}</p>
        </div>

        {/* Big RX Code Card */}
        <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/20 space-y-4">
          <span className="text-3xl font-bold font-mono tracking-widest text-slate-900 dark:text-teal-300 block bg-white dark:bg-slate-800 py-3 px-4 rounded-2xl border border-teal-500/30 shadow-xs">
            {prescription.rxCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 mx-auto transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.successCopied : t.successCopyBtn}</span>
          </button>
          <div className="pt-2 flex justify-center">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <QRCodeSVG value={prescription.qrCodeData} size={120} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.successPrintBtn}</span>
          </button>
          <button
            onClick={() => onViewDetails(prescription)}
            className="py-2.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>{t.successViewBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. RX DETAILS MODAL (FULL DIGITAL PRESCRIPTION VIEW)
// ==========================================
const RxDetailsModalComponent: React.FC<{
  prescription: Prescription;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
}> = ({ prescription, isOpen, onClose, isDarkMode, language }) => {
  const t = translations[language];
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const directUrl = prescription.qrCodeData.startsWith('http')
      ? prescription.qrCodeData
      : `${window.location.origin}/?rx=${encodeURIComponent(prescription.rxCode)}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getTimingLabel = (timing: string) => {
    switch (timing) {
      case 'after_meal': return t.timingAfterMeal || (language === 'ar' ? 'بعد الأكل' : 'After meal');
      case 'before_meal': return t.timingBeforeMeal || (language === 'ar' ? 'قبل الأكل' : 'Before meal');
      case 'with_meal': return t.timingWithMeal || (language === 'ar' ? 'مع الأكل' : 'With meal');
      case 'bedtime': return t.timingBedtime || (language === 'ar' ? 'عند النوم' : 'At bedtime');
      default: return t.timingDefault || (language === 'ar' ? 'حسب الإرشادات' : 'As directed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in text-start overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 my-auto animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                  {prescription.rxCode}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  prescription.status === 'dispensed' 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                }`}>
                  {prescription.status === 'dispensed' ? t.statusDispensed : t.statusActive}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal block">
                {language === 'ar' ? 'روشتة طبية رقمية معتمدة وموثقة' : 'Verified Digital Healthcare Prescription'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation Box & Link Sharer */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl bg-teal-500/10 dark:bg-teal-950/30 border border-teal-500/20">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
            <QRCodeSVG value={prescription.qrCodeData} size={110} />
          </div>
          <div className="space-y-2 text-center sm:text-start flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-300">
                {language === 'ar' ? 'امسح الكود بالهاتف أو الصيدلية' : 'Scan via Mobile or Pharmacy Reader'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-teal-500/20">
                PIN: {prescription.securityPin}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {language === 'ar' 
                ? 'يمكنك مسح كود الـ QR بكاميرا الهاتف لفتح الروشتة في أي وقت، أو مشاركة الرابط المباشر مع المريض.'
                : 'Scan this QR code with any mobile camera to view full prescription details, or share direct link.'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'ar' ? 'تم نسخ رابط الروشتة!' : 'Prescription Link Copied!') : (language === 'ar' ? 'نسخ رابط الروشتة' : 'Copy Direct Link')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs border border-slate-200/70 dark:border-slate-700">
          <div><strong className="text-slate-400 font-semibold">{t.detailsPatient}: </strong><span className="text-slate-900 dark:text-white font-bold">{prescription.patientName}</span></div>
          <div><strong className="text-slate-400 font-semibold">{t.detailsDoctor}: </strong><span className="text-slate-900 dark:text-white font-bold">{prescription.doctorName}</span></div>
          <div><strong className="text-slate-400 font-semibold">{t.detailsDiagnosis}: </strong><span className="text-slate-900 dark:text-white font-bold">{prescription.diagnosis || t.diagnosisFallback}</span></div>
          <div><strong className="text-slate-400 font-semibold">{t.detailsDate}: </strong><span className="text-slate-900 dark:text-white font-mono">{prescription.createdAt.split('T')[0]}</span></div>
          {prescription.patientAllergies && prescription.patientAllergies.length > 0 && (
            <div className="sm:col-span-2 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t.allergyLabel} {prescription.patientAllergies.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Medications list */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.detailsMedsTitle}</span>
          </h4>
          <div className="space-y-2">
            {prescription.medications.map((m, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold block text-sm text-slate-900 dark:text-white">{m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">{m.dosage} • {m.frequency} • {m.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold text-xs">
                    {getTimingLabel(m.timing)}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-xs">
                    {m.quantity} {t.pharmaPackCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical notes if present */}
        {prescription.clinicalNotes && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-400 font-semibold block mb-1">{language === 'ar' ? 'ملاحظات الطبيب:' : 'Clinical Notes:'}</strong>
            <p className="leading-relaxed font-normal">{prescription.clinicalNotes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.detailsBtnClose}
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.detailsBtnPrint}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
