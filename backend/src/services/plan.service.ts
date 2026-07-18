import { prisma } from '../lib/prisma';

export interface CreatePlanData {
  id?: string;
  facultyId?: string;
  subjectCode: string;
  academicWeekNumber: number;
  targetTopicIds: string | string[];
  status?: string;
}

export const createOrUpdatePlan = async (
  authenticatedUserId: string,
  data: CreatePlanData
) => {
  const planId = data.id || `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const topicsStr = Array.isArray(data.targetTopicIds)
    ? data.targetTopicIds.join(',')
    : data.targetTopicIds;
  const status = data.status || 'SUBMITTED';

  // Force facultyId to be authenticated user ID to prevent unauthorized spoofing
  const facultyId = authenticatedUserId;

  const plan = await prisma.weeklyPlan.upsert({
    where: { id: planId },
    update: {
      academicWeekNumber: data.academicWeekNumber,
      subjectCode: data.subjectCode,
      targetTopicIds: topicsStr,
      status,
      isDraft: status === 'DRAFT',
      facultyId,
    },
    create: {
      id: planId,
      academicWeekNumber: data.academicWeekNumber,
      subjectCode: data.subjectCode,
      targetTopicIds: topicsStr,
      status,
      isDraft: status === 'DRAFT',
      facultyId,
    },
  });

  return plan;
};
