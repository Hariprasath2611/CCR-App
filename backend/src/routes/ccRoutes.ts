import { Router } from 'express';
import {
  searchFaculty,
  allocateSubjectTeacher,
  getClassSubjectAllocations,
  removeSubjectAllocation,
} from '../controllers/cc.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { allocateSubjectSchema } from '../validators/cc.schema';

const router = Router();

// Allow authenticated users (Class Coordinators, HOD, ADMIN)
router.use(authenticateToken);

router.get('/faculty-search', searchFaculty);
router.get('/allocations/:classId', getClassSubjectAllocations);
router.post('/allocate', validateBody(allocateSubjectSchema), allocateSubjectTeacher);
router.delete('/allocate/:assignmentId', removeSubjectAllocation);

export default router;
