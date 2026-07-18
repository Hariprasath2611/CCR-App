import { Router } from 'express';
import { submitProgress } from '../controllers/progress.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { submitProgressSchema } from '../validators/progress.schema';

const router = Router();

router.post('/submit', authenticateToken, authorize('STAFF', 'HOD', 'ADMIN'), validateBody(submitProgressSchema), submitProgress);

export default router;
