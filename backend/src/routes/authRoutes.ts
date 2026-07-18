import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refresh, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, refreshSchema, changePasswordSchema } from '../validators/auth.schema';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per IP per 15 minutes
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);

export default router;
