import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface UserTokenPayload {
  id: string;
  email: string;
  role: string;
  isClassCoordinator: boolean;
  department: string;
  assignedClassId?: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as UserTokenPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isClassCoordinator: decoded.isClassCoordinator,
      department: decoded.department,
      assignedClassId: decoded.assignedClassId,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};
