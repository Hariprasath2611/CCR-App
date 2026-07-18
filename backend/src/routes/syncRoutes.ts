import { Router } from 'express';
import { syncInit } from '../controllers/sync.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/init', authenticateToken, syncInit);

export default router;
