import { Router } from 'express';
import { login, refresh, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/change-password', authenticateToken, changePassword);

export default router;
