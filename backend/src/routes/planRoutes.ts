import { Router } from 'express';
import { createPlan } from '../controllers/planController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/create', authenticateToken as any, createPlan as any);

export default router;
