import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'saferx_super_secure_jwt_secret_key_2026_99x';

/**
 * 1. Global Rate Limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز الحد المسموح به من الطلبات. يرجى الانتظار والمحاولة لاحقاً.' }
});

/**
 * 2. Strict Auth Rate Limiter (Brute Force Protection)
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // limit each IP to 15 login/register attempts per 10 mins
  message: { error: 'تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار 10 دقائق لحماية الحساب.' }
});

/**
 * 3. Security Headers Setup using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Allows cross-origin rendering if frontend is hosted separately
  crossOriginEmbedderPolicy: false
});

/**
 * 4. JWT Authentication Middleware
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    role: string;
    fullName: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'رمز الجلسة غير صالح أو منتهي الصلاحية' });
  }
}

/**
 * 5. Input Sanitizer Middleware
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      }
    }
  }
  next();
}
