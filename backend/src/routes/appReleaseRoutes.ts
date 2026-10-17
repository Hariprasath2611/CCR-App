import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAppVersion, getAppConfig, getLatestBundle } from '../controllers/appRelease.controller';

const router = Router();

// Public rate limiter: 120 requests per minute per IP
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/version', publicLimiter, getAppVersion);
router.get('/config', publicLimiter, getAppConfig);
router.get('/bundle/latest', publicLimiter, getLatestBundle);

export default router;
