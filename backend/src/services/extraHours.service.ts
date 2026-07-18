import { prisma } from '../lib/prisma';

export interface ExtraHoursRequestData {
  id?: string;
  facultyId?: string;
  subjectCode: string;
  classId: string;
  requestedDate: string;
  period: number;
  reason: string;
  status?: string;
}

export const createExtraHoursRequest = async (
  authenticatedUserId: string,
  data: ExtraHoursRequestData
) => {
  const reqId = data.id || `extra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const facultyId = authenticatedUserId;

  const request = await prisma.extraHourRequest.upsert({
    where: { id: reqId },
    update: {
      facultyId,
      subjectCode: data.subjectCode,
      classId: data.classId,
      requestedDate: data.requestedDate,
      period: Number(data.period),
      reason: data.reason,
      status: data.status || 'PENDING',
    },
    create: {
      id: reqId,
      facultyId,
      subjectCode: data.subjectCode,
      classId: data.classId,
      requestedDate: data.requestedDate,
      period: Number(data.period),
      reason: data.reason,
      status: data.status || 'PENDING',
    },
  });

  return request;
};
