import { Request, Response, NextFunction } from 'express';
import * as principalService from '../services/principal.service';

export const getPrincipalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await principalService.fetchPrincipalAnalyticsData();
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
};
