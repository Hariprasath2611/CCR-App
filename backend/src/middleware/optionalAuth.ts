import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserTokenPayload } from './auth';

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
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
  } catch (err) {
    // If token invalid, proceed without setting user
  }
  next();
};
