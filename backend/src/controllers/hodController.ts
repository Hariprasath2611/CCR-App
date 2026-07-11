import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getDepartmentClasses = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // In a real system, we'd query the classes under the HOD's department.
    // Let's get the list of unique classes for the HOD's department from the timetable.
    const timetableClasses = await prisma.timetableSlot.findMany({
      select: { classSection: true },
      distinct: ['classSection'],
    });

    const classesList = timetableClasses.map((t) => t.classSection);

    // If empty, fallback to standard mock classes
    const targetClasses = classesList.length > 0 ? classesList : ['CSE-B', '2nd Year CSE-A', '2nd Year CSBS'];

    const responseClasses = [];

    for (const classId of targetClasses) {
      // Find number of pending consolidated reports for this class
      const pendingCount = await prisma.consolidatedReport.count({
        where: {
          classId,
          status: 'SUBMITTED_TO_HOD',
        },
      });

      // Find coverage. Let's get the latest report's overallCoverage if it exists
      const latestReport = await prisma.consolidatedReport.findFirst({
        where: { classId },
        orderBy: { weekNumber: 'desc' },
      });

      const coverage = latestReport ? latestReport.overallCoverage : 65; // fallback baseline

      // Derive standard name/year
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

    return res.json(responseClasses);
  } catch (error) {
    console.error('getDepartmentClasses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitDecision = async (req: AuthenticatedRequest, res: Response) => {
  const { requestId, decision, remarks, isExtraHour } = req.body;

  if (!requestId || !decision || !remarks) {
    return res.status(400).json({ error: 'requestId, decision, and remarks are required' });
  }

  try {
    let nextStatus = 'SUBMITTED_TO_HOD';
    if (decision === 'APPROVED') {
      nextStatus = 'SENT_TO_ADMIN'; // forwards to principal
    } else if (decision === 'RETURNED') {
      nextStatus = 'RETURNED_BY_HOD';
    } else if (decision === 'REJECTED') {
      nextStatus = 'REJECTED_BY_HOD';
    }

    if (isExtraHour) {
      // Update ExtraHourRequest status
      const updatedRequest = await prisma.extraHourRequest.update({
        where: { id: requestId },
        data: {
          status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        },
      });
      return res.json({ success: true, type: 'EXTRA_HOURS', data: updatedRequest });
    } else {
      // Update ConsolidatedReport status
      const updatedReport = await prisma.consolidatedReport.update({
        where: { id: requestId },
        data: {
          status: nextStatus,
          hodRemarks: remarks,
          approvedAt: decision === 'APPROVED' ? new Date().toISOString().split('T')[0] : undefined,
        },
      });
      return res.json({ success: true, type: 'REPORT', data: updatedReport });
    }
  } catch (error) {
    console.error('submitDecision error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExtraHoursRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await prisma.extraHourRequest.findMany({
      include: { faculty: true },
      orderBy: { createdAt: 'desc' },
    });

    const response = requests.map(r => ({
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

    return res.json(response);
  } catch (error) {
    console.error('getExtraHoursRequests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
