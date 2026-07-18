import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/AppError';

export const getSyncInitData = async (user: { id: string; assignedClassId?: string }) => {
  if (!user || !user.id) {
    throw new AppError('Unauthorized', 401);
  }

  // 1. Get Timetable Slots for this faculty user
  const timetable = await prisma.timetableSlot.findMany({
    where: {
      OR: [
        { facultyId: user.id },
        { classSection: user.assignedClassId || undefined },
      ],
    },
  });

  // 2. Get Syllabus Nodes
  const syllabus = await prisma.syllabusNode.findMany();

  // 3. Get Weekly Target Plans submitted by or assigned to this faculty user
  const weeklyPlans = await prisma.weeklyPlan.findMany({
    where: {
      facultyId: user.id,
    },
  });

  // 4. Get Progress Logs submitted by this faculty user
  const progressLogs = await prisma.progressLog.findMany({
    where: {
      facultyId: user.id,
    },
  });

  return {
    timetable,
    syllabus,
    weeklyPlans,
    progressLogs,
  };
};
