import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const syncInit = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get Timetable Slots for this faculty user
    const timetable = await prisma.timetableSlot.findMany({
      where: {
        OR: [
          { facultyId: user.id },
          { classSection: user.assignedClassId || undefined }
        ]
      }
    });

    // 2. Get Syllabus Nodes
    const syllabus = await prisma.syllabusNode.findMany();

    // 3. Get Weekly Target Plans submitted by or assigned to this faculty user
    const weeklyPlans = await prisma.weeklyPlan.findMany({
      where: {
        facultyId: user.id
      }
    });

    // 4. Get Progress Logs submitted by this faculty user
    const progressLogs = await prisma.progressLog.findMany({
      where: {
        facultyId: user.id
      }
    });

    return res.json({
      timetable,
      syllabus,
      weeklyPlans,
      progressLogs,
    });
  } catch (error) {
    console.error('syncInit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
