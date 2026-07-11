import { Router } from 'express';
import { requestExtraHours } from '../controllers/extraHoursController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/request', authenticateToken as any, requestExtraHours as any);

export default router;
