import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';

/**
 * Constant-time string equality check to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant-time characteristics
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Rate limiter for admin endpoints
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes
  message: { error: 'Too many admin requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Audit log helper
 */
export async function logAdminAction(action: string, req: Request, details?: string) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  console.log(`[AUDIT] [${timestamp}] IP: ${ip} | Action: ${action} | UserAgent: ${userAgent}`);

  try {
    if ((prisma as any).adminAuditLog) {
      await (prisma as any).adminAuditLog.create({
        data: {
          action,
          ip: String(ip),
          userAgent: String(userAgent),
          details: details || null,
        },
      });
    }
  } catch (err) {
    // Non-blocking for audit logs
  }
}

/**
 * Middleware: Admin token verification
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const configuredToken = process.env.ADMIN_RELEASE_TOKEN || 'ccr_admin_secret_token_dev_2026';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>.',
    });
  }

  const providedToken = authHeader.split(' ')[1];

  if (!providedToken || !safeCompare(providedToken, configuredToken)) {
    return res.status(403).json({
      error: 'Forbidden: Invalid admin release token.',
    });
  }

  next();
};
