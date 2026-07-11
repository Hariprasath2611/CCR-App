import { Router } from 'express';
import { getWeeklyReport, compileReport } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/weekly/:classId/:weekNumber', authenticateToken as any, getWeeklyReport as any);
router.post('/compile', authenticateToken as any, compileReport as any);

export default router;
