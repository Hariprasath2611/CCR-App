import { Request, Response, NextFunction } from 'express';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles`,
      });
    }

    next();
  };
};

export const requireClassCoordinator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!req.user.isClassCoordinator && req.user.role !== 'HOD' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Requires Class Coordinator privileges',
    });
  }

  next();
};
