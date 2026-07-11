import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const requestExtraHours = async (req: AuthenticatedRequest, res: Response) => {
  const { id, facultyId, subjectCode, classId, requestedDate, period, reason, status } = req.body;

  if (!id || !facultyId || !subjectCode || !classId || !requestedDate || period === undefined || !reason) {
    return res.status(400).json({ error: 'Missing required extra hour request fields' });
  }

  try {
    const request = await prisma.extraHourRequest.upsert({
      where: { id },
      update: {
        facultyId,
        subjectCode,
        classId,
        requestedDate,
        period: parseInt(period),
        reason,
        status: status || 'PENDING',
      },
      create: {
        id,
        facultyId,
        subjectCode,
        classId,
        requestedDate,
        period: parseInt(period),
        reason,
        status: status || 'PENDING',
      },
    });

    return res.json({ success: true, request });
  } catch (error) {
    console.error('requestExtraHours error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
