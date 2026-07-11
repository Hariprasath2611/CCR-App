import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const submitProgress = async (req: AuthenticatedRequest, res: Response) => {
  const {
    id,
    facultyId,
    subjectCode,
    classId,
    academicWeekNumber,
    completedTopicIds,
    pendingTopicIds,
    reasonsForPending,
    extraHoursRequested,
    submittedAt,
  } = req.body;

  if (!id || !facultyId || !subjectCode || !classId || academicWeekNumber === undefined || !completedTopicIds) {
    return res.status(400).json({ error: 'Missing required progress log fields' });
  }

  try {
    const completedStr = Array.isArray(completedTopicIds) ? completedTopicIds.join(',') : completedTopicIds;
    const pendingStr = Array.isArray(pendingTopicIds) ? pendingTopicIds.join(',') : '';

    const log = await prisma.progressLog.upsert({
      where: { id },
      update: {
        facultyId,
        subjectCode,
        classId,
        academicWeekNumber,
        completedTopicIds: completedStr,
        pendingTopicIds: pendingStr,
        reasonsForPending: reasonsForPending || null,
        extraHoursRequested: !!extraHoursRequested,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      },
      create: {
        id,
        facultyId,
        subjectCode,
        classId,
        academicWeekNumber,
        completedTopicIds: completedStr,
        pendingTopicIds: pendingStr,
        reasonsForPending: reasonsForPending || null,
        extraHoursRequested: !!extraHoursRequested,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      },
    });

    return res.json({ success: true, log });
  } catch (error) {
    console.error('submitProgress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
