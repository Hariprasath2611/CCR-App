import { Router } from 'express';
import { getWeeklyReport, compileReport, listReports } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken as any, listReports as any);
router.get('/weekly/:classId/:weekNumber', authenticateToken as any, getWeeklyReport as any);
router.post('/compile', authenticateToken as any, compileReport as any);

export default router;
