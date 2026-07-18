import { Request, Response, NextFunction } from 'express';
import * as hodService from '../services/hod.service';

export const getDepartmentClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const classes = await hodService.fetchHODClasses(user?.department);
    return res.json(classes);
  } catch (error) {
    next(error);
  }
};

export const submitDecision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await hodService.processHODDecision(req.body);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getExtraHoursRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await hodService.fetchHODExtraHoursRequests();
    return res.json(requests);
  } catch (error) {
    next(error);
  }
};
