import { Request, Response, NextFunction } from 'express';
import * as erpCcrService from '../services/erpCcr.service';

/**
 * Flexible Course Coverage Log Submission for Faculty / ERP Client
 * Implements Algorithm 1 (Pace Analysis & Deficit Detection)
 */
export const submitLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUserId = (req as any).user?.id;
    const result = await erpCcrService.submitCcrProgressLog(authenticatedUserId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns class weekly report aggregated across all subjects
 * Implements Algorithm 2 (Aggregation, Class Average, Deficit Summary)
 */
export const getClassReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, weekNumber } = req.params;
    const result = await erpCcrService.aggregateClassWeeklyReport(classId, parseInt(weekNumber, 10));
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Compiles and freezes a weekly report (CC/HOD action or ERP trigger)
 */
export const compileWeekly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await erpCcrService.compileWeeklyReport(req.body);
    return res.status(200).json({ success: true, report: result });
  } catch (error) {
    next(error);
  }
};

/**
 * HOD / CC Review and Approval Endpoint
 */
export const reviewReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId, action, reviewerName, remarks } = req.body;
    const result = await erpCcrService.reviewWeeklyReport(reportId, action, reviewerName, remarks);
    return res.status(200).json({ success: true, report: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Master Academic Hierarchy: 1st Year (8 Sections) & 2nd/3rd/4th Year Departments
 */
export const getDepartmentsMatrix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matrix = erpCcrService.getDepartmentsMatrix();
    return res.json({ success: true, data: matrix });
  } catch (error) {
    next(error);
  }
};

/**
 * Department-level analytics summary
 */
export const getDeptSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department } = req.params;
    const weekNumber = req.query.weekNumber ? parseInt(req.query.weekNumber as string, 10) : undefined;
    const result = await erpCcrService.getDepartmentSummary(department, weekNumber);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
