import { Router } from 'express';
import { submitProgress } from '../controllers/progressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/submit', authenticateToken as any, submitProgress as any);

export default router;
