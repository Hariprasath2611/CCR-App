import { Router } from 'express';
import { getPrincipalAnalytics } from '../controllers/principal.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/analytics', authenticateToken, authorize('ADMIN', 'HOD'), getPrincipalAnalytics);

export default router;
