import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progress.service';

export const submitProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const log = await progressService.submitProgressLog(userId, req.body);
    return res.json({ success: true, log });
  } catch (error) {
    next(error);
  }
};
