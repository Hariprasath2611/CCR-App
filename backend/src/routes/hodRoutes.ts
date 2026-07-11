import { Router } from 'express';
import { getDepartmentClasses, submitDecision, getExtraHoursRequests } from '../controllers/hodController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/classes', authenticateToken as any, getDepartmentClasses as any);
router.post('/decision', authenticateToken as any, submitDecision as any);
router.get('/extra-hours', authenticateToken as any, getExtraHoursRequests as any);

export default router;
