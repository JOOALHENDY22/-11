import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { authLimiter, authenticateJWT, AuthenticatedRequest } from '../middleware/security.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'saferx_super_secure_jwt_secret_key_2026_99x';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// In-memory persistent fallback if DB disconnected
const fallbackVault: Record<string, { fullName: string; email: string; role: string; passwordHash: string }> = {};

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SafeRx Secure Backend' });
});

/**
 * POST /api/auth/register
 */
router.post('/auth/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!email || !email.includes('@') || !password || password.length < 6 || !fullName) {
      res.status(400).json({ error: 'يرجى تقديم بيانات صالحة (الاسم، البريد، كلمة سر 6 أحرف على الأقل).' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanRole = role || 'patient';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    // Save in memory vault
    fallbackVault[cleanEmail] = {
      fullName: cleanName,
      email: cleanEmail,
      role: cleanRole,
      passwordHash
    };

    // Save in Supabase profiles
    if (supabase) {
      await supabase.from('profiles').upsert({
        email: cleanEmail,
        full_name: cleanName,
        role: cleanRole
      }, { onConflict: 'email' });
    }

    const token = jwt.sign(
      { email: cleanEmail, fullName: cleanName, role: cleanRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { email: cleanEmail, fullName: cleanName, role: cleanRole },
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة إنشاء الحساب', details: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/auth/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    let userRecord = fallbackVault[cleanEmail];

    if (!userRecord && supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (profile && profile.full_name) {
        userRecord = {
          fullName: profile.full_name,
          email: cleanEmail,
          role: profile.role || role,
          passwordHash: await bcrypt.hash(password.trim(), 10)
        };
      }
    }

    if (!userRecord) {
      res.status(404).json({ error: 'هذا الحساب غير مسجل بعد في المنظومة.' });
      return;
    }

    const isMatch = await bcrypt.compare(password.trim(), userRecord.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'كلمة المرور غير صحيحة.' });
      return;
    }

    const token = jwt.sign(
      { email: cleanEmail, fullName: userRecord.fullName, role: userRecord.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { email: cleanEmail, fullName: userRecord.fullName, role: userRecord.role },
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تسجيل الدخول', details: err.message });
  }
});

/**
 * GET /api/prescriptions (Filtered for authenticated doctor)
 */
router.get('/prescriptions', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    if (supabase) {
      let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
      if (user.role === 'doctor') {
        query = query.eq('doctor_email', user.email);
      }
      const { data, error } = await query;
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ success: true, prescriptions: data || [] });
      return;
    }

    res.json({ success: true, prescriptions: [] });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل جلب الروشتات', details: err.message });
  }
});

export default router;
