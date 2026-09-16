import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config/env';
import { AppError } from '../middleware/AppError';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      subjectAssignments: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isClassCoordinator: user.isClassCoordinator,
    department: user.department,
    assignedClassId: user.assignedClassId || undefined,
    subjectAssignments: user.subjectAssignments || [],
  };

  const accessToken = jwt.sign(userSession, config.jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

  return {
    user: userSession,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('User not found', 401);
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

    const newAccessToken = jwt.sign(userSession, config.jwtSecret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Incorrect current password', 400);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { message: 'Password changed successfully' };
};
