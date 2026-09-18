import { PrescriptionStatus, SafetyAlert } from '../types';

export function formatDate(dateString?: string, lang: 'ar' | 'en' = 'ar'): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string, lang: 'ar' | 'en' = 'ar'): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getStatusDetails(status: PrescriptionStatus, lang: 'ar' | 'en' = 'ar'): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const isAr = lang === 'ar';

  switch (status) {
    case 'active':
      return {
        label: isAr ? 'سارية / محررة' : 'Active / Prescribed',
        bg: 'bg-medical-50',
        text: 'text-medical-700',
        border: 'border-medical-200',
        dot: 'bg-medical-500'
      };
    case 'verified':
      return {
        label: isAr ? 'تم التحقق في الصيدلية' : 'Verified by Pharmacy',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'clarification':
      return {
        label: isAr ? 'بانتظار توضيح الطبيب' : 'Clarification Requested',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'dispensed':
      return {
        label: isAr ? 'تم الصرف بأمان' : 'Safely Dispensed',
        bg: 'bg-mint-50',
        text: 'text-mint-700',
        border: 'border-mint-200',
        dot: 'bg-mint-500'
      };
    case 'cancelled':
      return {
        label: isAr ? 'ملغاة / باطلة' : 'Cancelled / Void',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
  }
}

export function getSeverityStyle(severity: SafetyAlert['severity']): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-900',
        border: 'border-rose-200',
        badge: 'bg-rose-600 text-white'
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-200',
        badge: 'bg-amber-600 text-white'
      };
    case 'info':
    default:
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-900',
        border: 'border-sky-200',
        badge: 'bg-sky-600 text-white'
      };
  }
}
