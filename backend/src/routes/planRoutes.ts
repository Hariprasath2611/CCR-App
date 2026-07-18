import { Router } from 'express';
import { createPlan } from '../controllers/plan.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { createPlanSchema } from '../validators/plan.schema';

const router = Router();

router.post('/create', authenticateToken, authorize('STAFF', 'HOD', 'ADMIN'), validateBody(createPlanSchema), createPlan);

export default router;
