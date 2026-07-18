import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';

export const getWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, weekNumber } = req.params;
    const result = await reportService.fetchWeeklyReport(classId, parseInt(weekNumber, 10));
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const compileReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.createConsolidatedReport(req.body);
    return res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

export const listReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.fetchAllReports();
    return res.json(reports);
  } catch (error) {
    next(error);
  }
};
