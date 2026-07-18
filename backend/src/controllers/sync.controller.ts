import { Request, Response, NextFunction } from 'express';
import * as syncService from '../services/sync.service';

export const syncInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await syncService.getSyncInitData(user);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
