import { Router } from 'express';
import { syncInit } from '../controllers/syncController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/init', authenticateToken as any, syncInit as any);

export default router;
