import { Router } from 'express';
import { getDepartmentClasses, submitDecision, getExtraHoursRequests } from '../controllers/hod.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { hodDecisionSchema } from '../validators/hod.schema';

const router = Router();

// Restrict all HOD routes to HOD or ADMIN role
router.use(authenticateToken, authorize('HOD', 'ADMIN'));

router.get('/classes', getDepartmentClasses);
router.post('/decision', validateBody(hodDecisionSchema), submitDecision);
router.get('/extra-hours', getExtraHoursRequests);

export default router;
