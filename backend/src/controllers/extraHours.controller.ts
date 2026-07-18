import { Request, Response, NextFunction } from 'express';
import * as extraHoursService from '../services/extraHours.service';

export const requestExtraHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const request = await extraHoursService.createExtraHoursRequest(userId, req.body);
    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};
