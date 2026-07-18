import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/AppError';

export interface SubmitDecisionData {
  requestId: string;
  decision: 'APPROVED' | 'RETURNED' | 'REJECTED';
  remarks: string;
  isExtraHour?: boolean;
}

export const fetchHODClasses = async (userDepartment?: string) => {
  // Query timetable slots to get unique classes in the department
  const timetableClasses = await prisma.timetableSlot.findMany({
    select: { classSection: true },
    distinct: ['classSection'],
  });

  const classesList = timetableClasses.map((t) => t.classSection);
  const targetClasses = classesList.length > 0 ? classesList : ['3rd Year CSE-A', 'CSE-B', '2nd Year CSBS'];

  const responseClasses = [];

  for (const classId of targetClasses) {
    const pendingCount = await prisma.consolidatedReport.count({
      where: {
        classId,
        status: 'SUBMITTED_TO_HOD',
      },
    });

    const latestReport = await prisma.consolidatedReport.findFirst({
      where: { classId },
      orderBy: { weekNumber: 'desc' },
    });

    const coverage = latestReport ? latestReport.overallCoverage : 0;

    let year = '2nd Year';
    if (classId.toLowerCase().includes('3rd') || classId.toLowerCase().includes('iii')) {
      year = '3rd Year';
    } else if (classId.toLowerCase().includes('4th') || classId.toLowerCase().includes('iv')) {
      year = '4th Year';
    }

    responseClasses.push({
      classId,
      name: classId.startsWith('2nd') || classId.startsWith('3rd') || classId.startsWith('4th') ? classId : `${year} ${classId}`,
      year,
      coverage,
      pendingCount,
    });
  }

  return responseClasses;
};

export const processHODDecision = async (data: SubmitDecisionData) => {
  const { requestId, decision, remarks, isExtraHour } = data;

  if (isExtraHour) {
    const existing = await prisma.extraHourRequest.findUnique({
      where: { id: requestId },
    });
    if (!existing) {
      throw new AppError('Extra hour request not found', 404);
    }

    const updatedRequest = await prisma.extraHourRequest.update({
      where: { id: requestId },
      data: {
        status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      },
    });
    return { type: 'EXTRA_HOURS', data: updatedRequest };
  } else {
    const existing = await prisma.consolidatedReport.findUnique({
      where: { id: requestId },
    });
    if (!existing) {
      throw new AppError('Consolidated report not found', 404);
    }

    let nextStatus = 'SUBMITTED_TO_HOD';
    if (decision === 'APPROVED') {
      nextStatus = 'SENT_TO_ADMIN'; // forwards to principal
    } else if (decision === 'RETURNED') {
      nextStatus = 'RETURNED_BY_HOD';
    } else if (decision === 'REJECTED') {
      nextStatus = 'REJECTED_BY_HOD';
    }

    const updatedReport = await prisma.consolidatedReport.update({
      where: { id: requestId },
      data: {
        status: nextStatus,
        hodRemarks: remarks,
        approvedAt: decision === 'APPROVED' ? new Date().toISOString().split('T')[0] : undefined,
      },
    });
    return { type: 'REPORT', data: updatedReport };
  }
};

export const fetchHODExtraHoursRequests = async () => {
  const requests = await prisma.extraHourRequest.findMany({
    include: { faculty: true },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    type: 'Extra Hour Request',
    faculty: r.faculty.name,
    subject: r.subjectCode,
    section: r.classId,
    requestedDate: r.requestedDate,
    period: `Period ${r.period}`,
    reason: r.reason,
    status: r.status,
  }));
};
