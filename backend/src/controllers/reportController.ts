import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getWeeklyReport = async (req: AuthenticatedRequest, res: Response) => {
  const { classId, weekNumber } = req.params;
  const weekNum = parseInt(weekNumber);

  if (!classId || isNaN(weekNum)) {
    return res.status(400).json({ error: 'Valid classId and weekNumber are required' });
  }

  try {
    // 1. Check if a compiled consolidated report already exists
    const existingReport = await prisma.consolidatedReport.findFirst({
      where: {
        classId,
        weekNumber: weekNum,
      },
    });

    if (existingReport) {
      return res.json({
        id: existingReport.id,
        classId: existingReport.classId,
        weekNumber: existingReport.weekNumber,
        overallCoverage: existingReport.overallCoverage,
        submittedBy: existingReport.submittedBy,
        submittedAt: existingReport.submittedAt,
        ccRemarks: existingReport.ccRemarks,
        status: existingReport.status,
        subjects: JSON.parse(existingReport.subjectsJson),
        hodRemarks: existingReport.hodRemarks,
        approvedAt: existingReport.approvedAt,
      });
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
            academicWeekNumber: { lte: weekNum },
          },
          orderBy: { academicWeekNumber: 'desc' },
        });

        // Find the weekly plan for this subject and week to display "Topics planned for this week"
        const weeklyPlan = await prisma.weeklyPlan.findFirst({
          where: {
            subjectCode: code,
            academicWeekNumber: weekNum,
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
          plannedTopicsText = nodes.map(n => n.topicTitle).join(', ');
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
          // Parse completed topic ids
          const completedArr = latestLog.completedTopicIds.split(',').filter(Boolean);
          completedTopicsCount = completedArr.length;
          coverage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
          
          if (latestLog.cumulativePercent) {
            cumulativePercent = latestLog.cumulativePercent;
            // Attempt to parse number for numeric coverage average calculation
            const pctMatch = latestLog.cumulativePercent.match(/(\d+)\s*%/);
            if (pctMatch) {
              coverage = parseInt(pctMatch[1]);
            } else {
              const numMatch = latestLog.cumulativePercent.match(/(\d+)/);
              if (numMatch) {
                coverage = parseInt(numMatch[1]);
              }
            }
          }

          fromDate = latestLog.fromDate || null;
          toDate = latestLog.toDate || null;
          
          // If they submitted a log exactly for this week, set status to Submitted
          if (latestLog.academicWeekNumber === weekNum) {
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

    // Calculate dynamic overall coverage
    const totalCoverage = subjectsProgress.reduce((sum, s) => sum + s.coverage, 0);
    const overallCoverage = subjectsProgress.length > 0 ? Math.round(totalCoverage / subjectsProgress.length) : 0;

    return res.json({
      id: `draft_${classId}_W${weekNum}`,
      classId,
      weekNumber: weekNum,
      overallCoverage,
      submittedBy: '',
      submittedAt: '',
      ccRemarks: '',
      status: 'PENDING_CC',
      subjects: subjectsProgress,
    });
  } catch (error) {
    console.error('getWeeklyReport error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const compileReport = async (req: AuthenticatedRequest, res: Response) => {
  const { id, classId, weekNumber, overallCoverage, submittedBy, ccRemarks, status, subjects } = req.body;

  if (!id || !classId || weekNumber === undefined || !submittedBy || !subjects) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  try {
    const report = await prisma.consolidatedReport.upsert({
      where: { id },
      update: {
        classId,
        weekNumber: parseInt(weekNumber),
        overallCoverage: parseInt(overallCoverage),
        submittedBy,
        submittedAt: new Date().toISOString().split('T')[0],
        ccRemarks,
        status,
        subjectsJson: JSON.stringify(subjects),
      },
      create: {
        id,
        classId,
        weekNumber: parseInt(weekNumber),
        overallCoverage: parseInt(overallCoverage),
        submittedBy,
        submittedAt: new Date().toISOString().split('T')[0],
        ccRemarks,
        status,
        subjectsJson: JSON.stringify(subjects),
      },
    });

    return res.json({ success: true, report });
  } catch (error) {
    console.error('compileReport error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await prisma.consolidatedReport.findMany({
      orderBy: { weekNumber: 'desc' },
    });

    const parsedReports = reports.map((r) => ({
      id: r.id,
      classId: r.classId,
      weekNumber: r.weekNumber,
      overallCoverage: r.overallCoverage,
      submittedBy: r.submittedBy,
      submittedAt: r.submittedAt,
      ccRemarks: r.ccRemarks,
      status: r.status,
      subjects: JSON.parse(r.subjectsJson),
      hodRemarks: r.hodRemarks || undefined,
      approvedAt: r.approvedAt || undefined,
    }));

    return res.json(parsedReports);
  } catch (error) {
    console.error('listReports error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
