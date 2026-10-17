import { Router } from 'express';
import { adminRateLimiter, authenticateAdmin } from '../middleware/adminAuth';
import {
  adminPublishRelease,
  adminUpdateConfig,
  adminRollback,
} from '../controllers/appRelease.controller';

const router = Router();

// Apply admin rate limiting and authentication to all admin release routes
router.use(adminRateLimiter);
router.use(authenticateAdmin);

router.post('/release', adminPublishRelease);
router.post('/config', adminUpdateConfig);
router.post('/rollback', adminRollback);

export default router;
