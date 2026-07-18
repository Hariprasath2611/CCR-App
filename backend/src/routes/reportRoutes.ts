import { Router } from 'express';
import { getWeeklyReport, compileReport, listReports } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize, requireClassCoordinator } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { compileReportSchema } from '../validators/report.schema';

const router = Router();

router.get('/', authenticateToken, listReports);
router.get('/weekly/:classId/:weekNumber', authenticateToken, getWeeklyReport);
router.post('/compile', authenticateToken, requireClassCoordinator, validateBody(compileReportSchema), compileReport);

export default router;
