import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/AppError';

export interface CompileReportData {
  id?: string;
  classId: string;
  weekNumber: number;
  overallCoverage: number;
  submittedBy: string;
  ccRemarks?: string;
  status?: string;
  subjects: any;
}

export const fetchWeeklyReport = async (classId: string, weekNumber: number) => {
  if (!classId || isNaN(weekNumber)) {
    throw new AppError('Valid classId and weekNumber are required', 400);
  }

  // 1. Check if a compiled consolidated report already exists
  const existingReport = await prisma.consolidatedReport.findFirst({
    where: {
      classId,
      weekNumber,
    },
  });

  if (existingReport) {
    let parsedSubjects = [];
    try {
      parsedSubjects = JSON.parse(existingReport.subjectsJson);
    } catch {
      parsedSubjects = [];
    }

    return {
      id: existingReport.id,
      classId: existingReport.classId,
      weekNumber: existingReport.weekNumber,
      overallCoverage: existingReport.overallCoverage,
      submittedBy: existingReport.submittedBy,
      submittedAt: existingReport.submittedAt,
      ccRemarks: existingReport.ccRemarks,
      status: existingReport.status,
      subjects: parsedSubjects,
      hodRemarks: existingReport.hodRemarks,
      approvedAt: existingReport.approvedAt,
    };
  }

  // 2. If it doesn't exist, compile dynamic preview of subject progress from database logs
  const timetableSlots = await prisma.timetableSlot.findMany({
    where: { classSection: classId },
    include: { faculty: true },
  });

  // Get unique subjects in the timetable for this class
  const uniqueSubjects = new Map<string, { name: string; facultyName: string }>();
  for (const slot of timetableSlots) {
    if (!uniqueSubjects.has(slot.subjectCode)) {
      uniqueSubjects.set(slot.subjectCode, {
        name: slot.subjectName,
        facultyName: slot.faculty.name,
      });
    }
  }

  const subjectsProgress = await Promise.all(
    Array.from(uniqueSubjects.entries()).map(async ([code, info]) => {
      // Find total syllabus nodes for this subject
      const totalTopicsCount = await prisma.syllabusNode.count({
        where: { subjectCode: code },
      });

      // Find the latest progress log for this week or prior weeks to represent cumulative progress
      const latestLog = await prisma.progressLog.findFirst({
        where: {
          classId,
          subjectCode: code,
          academicWeekNumber: { lte: weekNumber },
        },
        orderBy: { academicWeekNumber: 'desc' },
      });

      // Find the weekly plan for this subject and week to display "Topics planned for this week"
      const weeklyPlan = await prisma.weeklyPlan.findFirst({
        where: {
          subjectCode: code,
          academicWeekNumber: weekNumber,
        },
      });

      let plannedTopicsText = '';
      if (weeklyPlan && weeklyPlan.targetTopicIds) {
        const topicIds = weeklyPlan.targetTopicIds.split(',').filter(Boolean);
        const nodes = await prisma.syllabusNode.findMany({
          where: {
            subjectCode: code,
            topicId: { in: topicIds },
          },
        });
        plannedTopicsText = nodes.map((n: any) => n.topicTitle).join(', ');
      }

      let completedTopicsCount = 0;
      let status = 'Pending';
      let coverage = 0;
      let reasonsForPending = '';
      let extraHoursRequested = false;
      let periodsPlanned = null;
      let periodsHandled = null;
      let periodsRequired = null;
      let topicsCoveredText = '';
      let fromDate = null;
      let toDate = null;
      let cumulativePercent = null;

      if (latestLog) {
        const completedArr = latestLog.completedTopicIds.split(',').filter(Boolean);
        completedTopicsCount = completedArr.length;
        coverage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

        if (latestLog.cumulativePercent) {
          cumulativePercent = latestLog.cumulativePercent;
          const pctMatch = latestLog.cumulativePercent.match(/(\d+)\s*%/);
          if (pctMatch) {
            coverage = parseInt(pctMatch[1], 10);
          } else {
            const numMatch = latestLog.cumulativePercent.match(/(\d+)/);
            if (numMatch) {
              coverage = parseInt(numMatch[1], 10);
            }
          }
        }

        fromDate = latestLog.fromDate || null;
        toDate = latestLog.toDate || null;

        if (latestLog.academicWeekNumber === weekNumber) {
          status = 'Submitted';
        }
        reasonsForPending = latestLog.reasonsForPending || '';
        extraHoursRequested = latestLog.extraHoursRequested;
        periodsPlanned = latestLog.periodsPlanned;
        periodsHandled = latestLog.periodsHandled;
        periodsRequired = latestLog.periodsRequired;
        topicsCoveredText = latestLog.topicsCoveredText || '';
      }

      return {
        code,
        name: info.name,
        faculty: info.facultyName,
        coverage,
        status,
        completedTopicsCount,
        totalTopicsCount,
        reasonsForPending,
        extraHoursRequested,
        periodsPlanned,
        periodsHandled,
        periodsRequired,
        topicsCoveredText,
        plannedTopicsText: plannedTopicsText || 'Topics from syllabus schedule',
        fromDate,
        toDate,
        cumulativePercent,
      };
    })
  );

  const totalCoverage = subjectsProgress.reduce((sum, s) => sum + s.coverage, 0);
  const overallCoverage = subjectsProgress.length > 0 ? Math.round(totalCoverage / subjectsProgress.length) : 0;

  return {
    id: `draft_${classId}_W${weekNumber}`,
    classId,
    weekNumber,
    overallCoverage,
    submittedBy: '',
    submittedAt: '',
    ccRemarks: '',
    status: 'PENDING_CC',
    subjects: subjectsProgress,
  };
};

export const createConsolidatedReport = async (data: CompileReportData) => {
  const reportId = data.id || `report_${data.classId}_W${data.weekNumber}`;

  const report = await prisma.consolidatedReport.upsert({
    where: { id: reportId },
    update: {
      classId: data.classId,
      weekNumber: Number(data.weekNumber),
      overallCoverage: Number(data.overallCoverage),
      submittedBy: data.submittedBy,
      submittedAt: new Date().toISOString().split('T')[0],
      ccRemarks: data.ccRemarks || '',
      status: data.status || 'SUBMITTED_TO_HOD',
      subjectsJson: typeof data.subjects === 'string' ? data.subjects : JSON.stringify(data.subjects),
    },
    create: {
      id: reportId,
      classId: data.classId,
      weekNumber: Number(data.weekNumber),
      overallCoverage: Number(data.overallCoverage),
      submittedBy: data.submittedBy,
      submittedAt: new Date().toISOString().split('T')[0],
      ccRemarks: data.ccRemarks || '',
      status: data.status || 'SUBMITTED_TO_HOD',
      subjectsJson: typeof data.subjects === 'string' ? data.subjects : JSON.stringify(data.subjects),
    },
  });

  return report;
};

export const fetchAllReports = async () => {
  const reports = await prisma.consolidatedReport.findMany({
    orderBy: { weekNumber: 'desc' },
  });

  return reports.map((r: any) => {
    let parsedSubjects = [];
    try {
      parsedSubjects = JSON.parse(r.subjectsJson);
    } catch {
      parsedSubjects = [];
    }

    return {
      id: r.id,
      classId: r.classId,
      weekNumber: r.weekNumber,
      overallCoverage: r.overallCoverage,
      submittedBy: r.submittedBy,
      submittedAt: r.submittedAt,
      ccRemarks: r.ccRemarks,
      status: r.status,
      subjects: parsedSubjects,
      hodRemarks: r.hodRemarks || undefined,
      approvedAt: r.approvedAt || undefined,
    };
  });
};
