import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import { rxStore } from '../../store/rxStore';
import { DEMO_USERS } from '../../data/seedData';
import { 
  Stethoscope, 
  Pill, 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Building,
  FileBadge,
  HeartPulse
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  defaultRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  defaultRole = 'doctor',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor Fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');

  // Pharmacist Fields
  const [pharmacyLicense, setPharmacyLicense] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyBranch, setPharmacyBranch] = useState('');

  // Patient Fields
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('1995-08-14');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [allergies, setAllergies] = useState('Penicillin');
  const [chronicConditions, setChronicConditions] = useState('Hypertension');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleQuickDemoLogin = (role: UserRole) => {
    rxStore.switchRole(role);
    setMessage({ text: `Logged in as ${DEMO_USERS[role].user.fullName} (${role})`, type: 'success' });
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      if (!email) {
        setMessage({ text: 'Please enter your email address.', type: 'error' });
        return;
      }
      setMessage({
        text: `A secure password reset link has been dispatched to ${email}.`,
        type: 'success'
      });
      setTimeout(() => setMode('login'), 2500);
      return;
    }

    if (mode === 'login') {
      if (!email) {
        setMessage({ text: 'Please enter your email address.', type: 'error' });
        return;
      }
      rxStore.loginUser(email, selectedRole);
      setMessage({ text: 'Authentication successful. Redirecting...', type: 'success' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
      return;
    }

    // Register
    if (mode === 'register') {
      if (!email || !fullName) {
        setMessage({ text: 'Please fill out all required personal fields.', type: 'error' });
        return;
      }

      rxStore.registerUser(
        { email, fullName, role: selectedRole, phone },
        {
          licenseNumber: selectedRole === 'doctor' ? licenseNumber : pharmacyLicense,
          specialty,
          hospitalAffiliation,
          pharmacyName,
          pharmacyBranch,
          nationalId,
          dateOfBirth: dob,
          bloodGroup,
          allergies,
          chronicConditions
        }
      );

      setMessage({ text: `Registration complete! Welcome to SafeRx, ${fullName}.`, type: 'success' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        mode === 'forgot'
          ? 'Reset Password'
          : mode === 'login'
          ? 'Sign in to SafeRx'
          : 'Create Healthcare Account'
      }
      subtitle={
        mode === 'forgot'
          ? 'Enter your registered email to receive recovery instructions.'
          : mode === 'login'
          ? 'Access your clinical dashboard or digital prescription wallet.'
          : 'Join the verified medication-safety network.'
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-mint-50 text-mint-800 border border-mint-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-mint-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Quick Demo Login Preset Buttons */}
        {mode === 'login' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                1-Click Verified Demo Logins:
              </span>
              <span className="text-[10px] text-slate-500">No password required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor')}
                className="p-2.5 rounded-xl bg-white border border-medical-200 hover:border-medical-500 text-left transition-all hover:shadow-sm group"
              >
                <div className="flex items-center gap-1.5 text-medical-700 font-bold text-xs">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Dr. Ahmed</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cardiologist</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('pharmacist')}
                className="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-500 text-left transition-all hover:shadow-sm group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Pharm. Omar</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Al-Shifa Pharmacy</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient')}
                className="p-2.5 rounded-xl bg-white border border-mint-200 hover:border-mint-500 text-left transition-all hover:shadow-sm group"
              >
                <div className="flex items-center gap-1.5 text-mint-700 font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>Youssef M.</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Patient</div>
              </button>
            </div>
          </div>
        )}

        {/* Role Selector (For Registration or Mode switching) */}
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'doctor'
                    ? 'bg-medical-50/80 border-medical-500 text-medical-800 ring-2 ring-medical-500/20 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-5 h-5 mx-auto mb-1 text-medical-600" />
                <span className="text-xs font-bold block">Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('pharmacist')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'pharmacist'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs font-bold block">Pharmacist</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'patient'
                    ? 'bg-mint-50/80 border-mint-500 text-mint-800 ring-2 ring-mint-500/20 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1 text-mint-600" />
                <span className="text-xs font-bold block">Patient</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (with title if applicable)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={selectedRole === 'doctor' ? 'Dr. Sarah Connor' : 'Sarah Connor'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@healthcare.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500 text-sm"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-medical-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Role-Specific Fields during Registration */}
          {mode === 'register' && selectedRole === 'doctor' && (
            <div className="p-4 rounded-2xl bg-medical-50/50 border border-medical-100 space-y-3">
              <span className="text-xs font-bold text-medical-800 uppercase tracking-wider block">
                Doctor Credentials
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DOC-EG-99401"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consultant Internal Medicine"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hospital / Clinic Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g. Specialized Medical Center"
                  value={hospitalAffiliation}
                  onChange={(e) => setHospitalAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}

          {mode === 'register' && selectedRole === 'pharmacist' && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                Pharmacy Verification Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Pharmacist License</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PH-EG-88219"
                    value={pharmacyLicense}
                    onChange={(e) => setPharmacyLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Pharmacy Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Amal Pharmacy"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Central Branch"
                  value={pharmacyBranch}
                  onChange={(e) => setPharmacyBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}

          {mode === 'register' && selectedRole === 'patient' && (
            <div className="p-4 rounded-2xl bg-mint-50/50 border border-mint-100 space-y-3">
              <span className="text-xs font-bold text-mint-800 uppercase tracking-wider block">
                Patient Health Passport
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">National ID / Health ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 29508140102938"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Known Allergies (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Asthma"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-navy-900 text-white hover:bg-medical-600 font-bold text-sm shadow-md shadow-navy-950/20 transition-all"
          >
            {mode === 'forgot'
              ? 'Send Reset Link'
              : mode === 'login'
              ? 'Sign In to Account'
              : 'Complete Healthcare Registration'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-medical-600 font-bold hover:underline ml-1"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-medical-600 font-bold hover:underline ml-1"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
