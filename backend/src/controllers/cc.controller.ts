import { Request, Response, NextFunction } from 'express';
import * as ccService from '../services/cc.service';
import { AppError } from '../middleware/AppError';

export const searchFaculty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || '';
    const faculty = await ccService.searchFaculty(query);
    return res.json(faculty);
  } catch (error) {
    next(error);
  }
};

export const allocateSubjectTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignedByCcId = req.user?.id;
    if (!assignedByCcId) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await ccService.allocateSubjectTeacher({
      ...req.body,
      assignedByCcId,
    });

    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getClassSubjectAllocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = req.params.classId || req.user?.assignedClassId;
    if (!classId) {
      throw new AppError('Class ID is required', 400);
    }

    const result = await ccService.getClassSubjectAllocations(classId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const removeSubjectAllocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const result = await ccService.removeSubjectAllocation(assignmentId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
