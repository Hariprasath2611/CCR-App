import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ccms_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_ccms_refresh_key_12345';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isClassCoordinator: user.isClassCoordinator,
      department: user.department,
      assignedClassId: user.assignedClassId || undefined,
    };

    const accessToken = jwt.sign(userSession, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return res.json({
      user: userSession,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isClassCoordinator: user.isClassCoordinator,
      department: user.department,
      assignedClassId: user.assignedClassId || undefined,
    };

    const newAccessToken = jwt.sign(userSession, JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
