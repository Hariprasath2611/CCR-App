import { Router } from 'express';
import {
  getDepartmentClasses,
  submitDecision,
  getExtraHoursRequests,
  getDepartmentCoordinators,
  assignCoordinator,
  deleteCoordinator,
} from '../controllers/hod.controller';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { hodDecisionSchema, assignCoordinatorSchema } from '../validators/hod.schema';

const router = Router();

// Restrict all HOD routes to HOD or ADMIN role
router.use(authenticateToken, authorize('HOD', 'ADMIN'));

router.get('/classes', getDepartmentClasses);
router.post('/decision', validateBody(hodDecisionSchema), submitDecision);
router.get('/extra-hours', getExtraHoursRequests);

// Class Coordinator Management
router.get('/coordinators', getDepartmentCoordinators);
router.post('/coordinators', validateBody(assignCoordinatorSchema), assignCoordinator);
router.delete('/coordinators/:classId', deleteCoordinator);

export default router;

