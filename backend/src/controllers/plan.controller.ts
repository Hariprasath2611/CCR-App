import { Request, Response, NextFunction } from 'express';
import * as planService from '../services/plan.service';

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = await planService.createOrUpdatePlan(userId, req.body);
    return res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};
