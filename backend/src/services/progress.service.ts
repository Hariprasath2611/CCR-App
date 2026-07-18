import { prisma } from '../lib/prisma';

export interface SubmitProgressData {
  id?: string;
  facultyId?: string;
  subjectCode: string;
  classId: string;
  academicWeekNumber: number;
  completedTopicIds: string | string[];
  pendingTopicIds?: string | string[];
  reasonsForPending?: string | null;
  extraHoursRequested?: boolean;
  submittedAt?: string;
  periodsPlanned?: number | null;
  periodsHandled?: number | null;
  periodsRequired?: number | null;
  topicsCoveredText?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  cumulativePercent?: string | null;
}

export const submitProgressLog = async (
  authenticatedUserId: string,
  data: SubmitProgressData
) => {
  const logId = data.id || `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const completedStr = Array.isArray(data.completedTopicIds)
    ? data.completedTopicIds.join(',')
    : data.completedTopicIds;
  const pendingStr = Array.isArray(data.pendingTopicIds)
    ? data.pendingTopicIds.join(',')
    : '';

  const pPlanned = data.periodsPlanned !== undefined && data.periodsPlanned !== null ? Number(data.periodsPlanned) : null;
  const pHandled = data.periodsHandled !== undefined && data.periodsHandled !== null ? Number(data.periodsHandled) : null;
  const pRequired = data.periodsRequired !== undefined && data.periodsRequired !== null ? Number(data.periodsRequired) : null;

  // Force facultyId to authenticated user
  const facultyId = authenticatedUserId;

  const log = await prisma.progressLog.upsert({
    where: { id: logId },
    update: {
      facultyId,
      subjectCode: data.subjectCode,
      classId: data.classId,
      academicWeekNumber: data.academicWeekNumber,
      completedTopicIds: completedStr,
      pendingTopicIds: pendingStr,
      reasonsForPending: data.reasonsForPending || null,
      extraHoursRequested: !!data.extraHoursRequested,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      periodsPlanned: pPlanned,
      periodsHandled: pHandled,
      periodsRequired: pRequired,
      topicsCoveredText: data.topicsCoveredText || null,
      fromDate: data.fromDate || null,
      toDate: data.toDate || null,
      cumulativePercent: data.cumulativePercent || null,
    },
    create: {
      id: logId,
      facultyId,
      subjectCode: data.subjectCode,
      classId: data.classId,
      academicWeekNumber: data.academicWeekNumber,
      completedTopicIds: completedStr,
      pendingTopicIds: pendingStr,
      reasonsForPending: data.reasonsForPending || null,
      extraHoursRequested: !!data.extraHoursRequested,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      periodsPlanned: pPlanned,
      periodsHandled: pHandled,
      periodsRequired: pRequired,
      topicsCoveredText: data.topicsCoveredText || null,
      fromDate: data.fromDate || null,
      toDate: data.toDate || null,
      cumulativePercent: data.cumulativePercent || null,
    },
  });

  return log;
};
