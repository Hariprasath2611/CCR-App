import { Router } from 'express';
import { requestExtraHours } from '../controllers/extraHours.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { requestExtraHoursSchema } from '../validators/extraHours.schema';

const router = Router();

router.post('/request', authenticateToken, authorize('STAFF', 'HOD', 'ADMIN'), validateBody(requestExtraHoursSchema), requestExtraHours);

export default router;
