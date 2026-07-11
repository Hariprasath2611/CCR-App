import { Router } from 'express';
import { getPrincipalAnalytics } from '../controllers/principalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/analytics', authenticateToken as any, getPrincipalAnalytics as any);

export default router;
