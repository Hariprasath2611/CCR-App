import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/AppError';

// ── TYPES & INTERFACES ──

export interface CcrLogInput {
  id?: string;
  facultyId?: string;
  facultyName?: string;
  facultyEmail?: string;
  academicYear: string; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  department: string; // e.g. "CSE", "IT", "AIML/CSBS", "General Engineering"
  classId: string; // e.g. "1st Year SEC-B", "3rd Year CSE-A"
  subjectCode: string;
  subjectName: string;
  academicWeekNumber: number;
  fromDate: string;
  toDate: string;
  unitSelected: string;
  temporaryUnit?: string | null;
  topicsCoveredText: string;
  completedOnPlan: 'YES' | 'NO';
  reasonsForPending?: string | null;
  periodsPlanned: number;
  periodsHandled: number;
  periodsRequired?: number;
  cumulativePercent: string;
  completedTopicIds?: string | string[];
  pendingTopicIds?: string | string[];
  extraHoursRequested?: boolean;
}

export interface PaceAnalysisResult {
  paceRatio: number;
  periodsDeficit: number;
  isDeficit: boolean;
  parsedCoveragePercent: number;
  healthStatus: 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'CRITICAL_LAG';
  requiresExtraHours: boolean;
  suggestedExtraHours: number;
}

export interface AggregatedSubjectItem {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  status: 'SUBMITTED' | 'NOT_SUBMITTED' | 'PENDING';
  coveragePercent: number;
  unitSelected: string;
  temporaryUnit: string | null;
  topicsCoveredText: string;
  completedOnPlan: string;
  periodsPlanned: number;
  periodsHandled: number;
  periodsRequired: number;
  periodsDeficit: number;
  paceRatio: number;
  isDeficit: boolean;
  reasonsForPending: string;
  extraHoursRequested: boolean;
  fromDate: string;
  toDate: string;
  cumulativePercent: string;
}

export interface ClassWeeklyReportSummary {
  reportId: string;
  classId: string;
  academicWeekNumber: number;
  overallCoverage: number;
  totalSubjects: number;
  submittedSubjectsCount: number;
  pendingSubjectsCount: number;
  laggingSubjectsCount: number;
  totalPeriodsPlanned: number;
  totalPeriodsHandled: number;
  totalPeriodsDeficit: number;
  status: string;
  ccRemarks?: string;
  hodRemarks?: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedAt?: string;
  subjects: AggregatedSubjectItem[];
  recommendations: string[];
}

// ── ALGORITHM 1: SYLLABUS COVERAGE & ACADEMIC PACE ANALYZER ──

/**
 * Algorithm 1: Evaluates a single course log's academic velocity,
 * deficit periods, and cumulative syllabus health.
 */
export const analyzeSyllabusPace = (
  periodsPlanned: number,
  periodsHandled: number,
  completedOnPlan: 'YES' | 'NO',
  cumulativePercentStr: string
): PaceAnalysisResult => {
  const pPlan = Math.max(0, Number(periodsPlanned) || 0);
  const pHandled = Math.max(0, Number(periodsHandled) || 0);

  // 1. Pace Ratio Calculation
  const paceRatio = pPlan > 0 ? Number((pHandled / pPlan).toFixed(2)) : 1.0;

  // 2. Deficit Periods Calculation
  const periodsDeficit = Math.max(0, pPlan - pHandled);
  const isDeficit = periodsDeficit > 0 || completedOnPlan === 'NO';

  // 3. Extract standardized integer percentage (0 - 100) from cumulative string
  let parsedCoveragePercent = 0;
  if (cumulativePercentStr) {
    const pctMatch = cumulativePercentStr.match(/(\d+)\s*%/);
    if (pctMatch) {
      parsedCoveragePercent = Math.min(100, Math.max(0, parseInt(pctMatch[1], 10)));
    } else {
      const numMatch = cumulativePercentStr.match(/(\d+)/);
      if (numMatch) {
        parsedCoveragePercent = Math.min(100, Math.max(0, parseInt(numMatch[1], 10)));
      }
    }
  }

  // 4. Health Status Classification
  let healthStatus: 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'CRITICAL_LAG' = 'ON_TRACK';
  if (paceRatio < 0.7 || periodsDeficit >= 3) {
    healthStatus = 'CRITICAL_LAG';
  } else if (paceRatio < 1.0 || isDeficit) {
    healthStatus = 'BEHIND_SCHEDULE';
  }

  return {
    paceRatio,
    periodsDeficit,
    isDeficit,
    parsedCoveragePercent,
    healthStatus,
    requiresExtraHours: isDeficit,
    suggestedExtraHours: periodsDeficit,
  };
};

/**
 * Submits a flexible CCR progress log. Works with or without pre-allocated subject records.
 */
export const submitCcrProgressLog = async (
  authenticatedUserId: string | undefined,
  input: CcrLogInput
) => {
  // 1. Run Algorithm 1
  const analysis = analyzeSyllabusPace(
    input.periodsPlanned,
    input.periodsHandled,
    input.completedOnPlan,
    input.cumulativePercent
  );

  // Determine effective faculty ID (from auth or input)
  let facultyId = authenticatedUserId || input.facultyId;

  // If no facultyId provided, look up or create staff profile on the fly
  if (!facultyId && input.facultyEmail) {
    let user = await prisma.user.findUnique({
      where: { email: input.facultyEmail.toLowerCase().trim() },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: input.facultyEmail.toLowerCase().trim(),
          name: input.facultyName || 'Faculty Member',
          role: 'STAFF',
          department: input.department || 'General Engineering',
          passwordHash: '$2a$10$e8w.x7W4gT11yN1JzX5BMeQe3hZzJg6.51c1E4n.b51rV7cK6rB7m', // default hash
        },
      });
    }
    facultyId = user.id;
  } else if (!facultyId) {
    // Fallback to first admin or default user
    const firstUser = await prisma.user.findFirst();
    facultyId = firstUser?.id || 'anonymous_staff';
  }

  const logId = input.id || `prog_${input.subjectCode}_${input.classId}_W${input.academicWeekNumber}_${Date.now()}`;

  const completedStr = Array.isArray(input.completedTopicIds)
    ? input.completedTopicIds.join(',')
    : input.completedTopicIds || '';
  const pendingStr = Array.isArray(input.pendingTopicIds)
    ? input.pendingTopicIds.join(',')
    : input.pendingTopicIds || '';

  // 2. Persist to MongoDB ProgressLog
  const savedLog = await prisma.progressLog.upsert({
    where: { id: logId },
    update: {
      facultyId,
      subjectCode: input.subjectCode,
      classId: input.classId,
      academicWeekNumber: input.academicWeekNumber,
      completedTopicIds: completedStr,
      pendingTopicIds: pendingStr,
      reasonsForPending: input.reasonsForPending || null,
      extraHoursRequested: input.extraHoursRequested || analysis.requiresExtraHours,
      submittedAt: new Date(),
      periodsPlanned: input.periodsPlanned,
      periodsHandled: input.periodsHandled,
      periodsRequired: input.periodsRequired || analysis.suggestedExtraHours,
      topicsCoveredText: input.topicsCoveredText,
      fromDate: input.fromDate,
      toDate: input.toDate,
      cumulativePercent: input.cumulativePercent,
    },
    create: {
      id: logId,
      facultyId,
      subjectCode: input.subjectCode,
      classId: input.classId,
      academicWeekNumber: input.academicWeekNumber,
      completedTopicIds: completedStr,
      pendingTopicIds: pendingStr,
      reasonsForPending: input.reasonsForPending || null,
      extraHoursRequested: input.extraHoursRequested || analysis.requiresExtraHours,
      submittedAt: new Date(),
      periodsPlanned: input.periodsPlanned,
      periodsHandled: input.periodsHandled,
      periodsRequired: input.periodsRequired || analysis.suggestedExtraHours,
      topicsCoveredText: input.topicsCoveredText,
      fromDate: input.fromDate,
      toDate: input.toDate,
      cumulativePercent: input.cumulativePercent,
    },
    include: {
      faculty: {
        select: { id: true, name: true, email: true, department: true },
      },
    },
  });

  return {
    success: true,
    message: 'Course coverage progress log successfully saved',
    log: savedLog,
    analysis,
  };
};

// ── ALGORITHM 2: WEEKLY CLASS CCR AGGREGATION & MULTI-TIER APPROVAL ENGINE ──

/**
 * Algorithm 2: Compiles weekly subject logs across an entire class/section,
 * calculates overall coverage, identifies deficit subjects, and tracks approval states.
 */
export const aggregateClassWeeklyReport = async (
  classId: string,
  weekNumber: number
): Promise<ClassWeeklyReportSummary> => {
  if (!classId || isNaN(weekNumber)) {
    throw new AppError('Valid classId and weekNumber are required', 400);
  }

  // 1. Check if a compiled consolidated report already exists
  const existingReport = await prisma.consolidatedReport.findFirst({
    where: { classId, weekNumber },
  });

  if (existingReport) {
    let parsedSubjects: AggregatedSubjectItem[] = [];
    try {
      parsedSubjects = JSON.parse(existingReport.subjectsJson);
    } catch {
      parsedSubjects = [];
    }

    const laggingSubjects = parsedSubjects.filter((s) => s.isDeficit || s.paceRatio < 1.0);
    const totalPlanned = parsedSubjects.reduce((sum, s) => sum + (s.periodsPlanned || 0), 0);
    const totalHandled = parsedSubjects.reduce((sum, s) => sum + (s.periodsHandled || 0), 0);
    const totalDeficit = parsedSubjects.reduce((sum, s) => sum + (s.periodsDeficit || 0), 0);

    const recommendations = laggingSubjects.map(
      (s) => `Subject ${s.subjectCode} (${s.subjectName}) is lagging by ${s.periodsDeficit} periods. Recommended: Allocate ${s.periodsDeficit || 1} extra hour(s).`
    );

    return {
      reportId: existingReport.id,
      classId: existingReport.classId,
      academicWeekNumber: existingReport.weekNumber,
      overallCoverage: existingReport.overallCoverage,
      totalSubjects: parsedSubjects.length,
      submittedSubjectsCount: parsedSubjects.filter((s) => s.status === 'SUBMITTED').length,
      pendingSubjectsCount: parsedSubjects.filter((s) => s.status !== 'SUBMITTED').length,
      laggingSubjectsCount: laggingSubjects.length,
      totalPeriodsPlanned: totalPlanned,
      totalPeriodsHandled: totalHandled,
      totalPeriodsDeficit: totalDeficit,
      status: existingReport.status,
      ccRemarks: existingReport.ccRemarks,
      hodRemarks: existingReport.hodRemarks || undefined,
      submittedBy: existingReport.submittedBy,
      submittedAt: existingReport.submittedAt,
      approvedAt: existingReport.approvedAt || undefined,
      subjects: parsedSubjects,
      recommendations,
    };
  }

  // 2. If no frozen report exists, dynamically compile from ProgressLogs & Timetable
  const logs = await prisma.progressLog.findMany({
    where: {
      classId,
      academicWeekNumber: weekNumber,
    },
    include: { faculty: true },
  });

  // Also query timetable / subject assignments to find missing subjects
  const timetableSlots = await prisma.timetableSlot.findMany({
    where: { classSection: classId },
    include: { faculty: true },
  });

  const subjectMap = new Map<string, AggregatedSubjectItem>();

  // Add all logged subjects
  for (const log of logs) {
    const analysis = analyzeSyllabusPace(
      log.periodsPlanned || 0,
      log.periodsHandled || 0,
      (log.reasonsForPending ? 'NO' : 'YES'),
      log.cumulativePercent || ''
    );

    subjectMap.set(log.subjectCode, {
      subjectCode: log.subjectCode,
      subjectName: log.subjectCode, // Fallback, will refine from timetable
      facultyName: log.faculty?.name || 'Faculty Member',
      status: 'SUBMITTED',
      coveragePercent: analysis.parsedCoveragePercent,
      unitSelected: 'Unit 1',
      temporaryUnit: null,
      topicsCoveredText: log.topicsCoveredText || '',
      completedOnPlan: log.reasonsForPending ? 'NO' : 'YES',
      periodsPlanned: log.periodsPlanned || 0,
      periodsHandled: log.periodsHandled || 0,
      periodsRequired: log.periodsRequired || 0,
      periodsDeficit: analysis.periodsDeficit,
      paceRatio: analysis.paceRatio,
      isDeficit: analysis.isDeficit,
      reasonsForPending: log.reasonsForPending || '',
      extraHoursRequested: log.extraHoursRequested,
      fromDate: log.fromDate || '',
      toDate: log.toDate || '',
      cumulativePercent: log.cumulativePercent || `${analysis.parsedCoveragePercent}%`,
    });
  }

  // Populate names and missing subjects from timetable
  for (const slot of timetableSlots) {
    if (subjectMap.has(slot.subjectCode)) {
      const existing = subjectMap.get(slot.subjectCode)!;
      existing.subjectName = slot.subjectName;
    } else {
      // Missing / Pending subject
      subjectMap.set(slot.subjectCode, {
        subjectCode: slot.subjectCode,
        subjectName: slot.subjectName,
        facultyName: slot.faculty?.name || 'Faculty Member',
        status: 'NOT_SUBMITTED',
        coveragePercent: 0,
        unitSelected: 'Pending',
        temporaryUnit: null,
        topicsCoveredText: 'Not submitted yet',
        completedOnPlan: 'NO',
        periodsPlanned: 4,
        periodsHandled: 0,
        periodsRequired: 4,
        periodsDeficit: 4,
        paceRatio: 0,
        isDeficit: true,
        reasonsForPending: 'Submission Pending from Faculty',
        extraHoursRequested: false,
        fromDate: '',
        toDate: '',
        cumulativePercent: '0%',
      });
    }
  }

  const subjectsList = Array.from(subjectMap.values());
  const totalCoverage = subjectsList.reduce((sum, s) => sum + s.coveragePercent, 0);
  const overallCoverage = subjectsList.length > 0 ? Math.round(totalCoverage / subjectsList.length) : 0;

  const laggingSubjects = subjectsList.filter((s) => s.isDeficit || s.paceRatio < 1.0);
  const totalPlanned = subjectsList.reduce((sum, s) => sum + (s.periodsPlanned || 0), 0);
  const totalHandled = subjectsList.reduce((sum, s) => sum + (s.periodsHandled || 0), 0);
  const totalDeficit = subjectsList.reduce((sum, s) => sum + (s.periodsDeficit || 0), 0);

  const recommendations = laggingSubjects.map(
    (s) => `Subject ${s.subjectCode} (${s.subjectName}) is lagging by ${s.periodsDeficit} periods. Recommended: Allocate ${s.periodsDeficit || 1} extra hour(s).`
  );

  return {
    reportId: `draft_${classId}_W${weekNumber}`,
    classId,
    academicWeekNumber: weekNumber,
    overallCoverage,
    totalSubjects: subjectsList.length,
    submittedSubjectsCount: subjectsList.filter((s) => s.status === 'SUBMITTED').length,
    pendingSubjectsCount: subjectsList.filter((s) => s.status !== 'SUBMITTED').length,
    laggingSubjectsCount: laggingSubjects.length,
    totalPeriodsPlanned: totalPlanned,
    totalPeriodsHandled: totalHandled,
    totalPeriodsDeficit: totalDeficit,
    status: 'PENDING_CC',
    ccRemarks: '',
    subjects: subjectsList,
    recommendations,
  };
};

/**
 * Compiles and freezes a weekly report for CC / HOD pipeline.
 */
export const compileWeeklyReport = async (data: {
  classId: string;
  weekNumber: number;
  compiledBy: string;
  ccRemarks?: string;
  overallCoverage?: number;
  subjects?: any;
}) => {
  const reportId = `report_${data.classId}_W${data.weekNumber}`;

  let subjectsJson = '';
  let overallCoverage = data.overallCoverage || 0;

  if (data.subjects) {
    subjectsJson = typeof data.subjects === 'string' ? data.subjects : JSON.stringify(data.subjects);
  } else {
    // Dynamic aggregation if subjects not passed
    const summary = await aggregateClassWeeklyReport(data.classId, data.weekNumber);
    subjectsJson = JSON.stringify(summary.subjects);
    overallCoverage = summary.overallCoverage;
  }

  const report = await prisma.consolidatedReport.upsert({
    where: { id: reportId },
    update: {
      classId: data.classId,
      weekNumber: Number(data.weekNumber),
      overallCoverage: Number(overallCoverage),
      submittedBy: data.compiledBy,
      submittedAt: new Date().toISOString().split('T')[0],
      ccRemarks: data.ccRemarks || '',
      status: 'SUBMITTED_TO_HOD',
      subjectsJson,
    },
    create: {
      id: reportId,
      classId: data.classId,
      weekNumber: Number(data.weekNumber),
      overallCoverage: Number(overallCoverage),
      submittedBy: data.compiledBy,
      submittedAt: new Date().toISOString().split('T')[0],
      ccRemarks: data.ccRemarks || '',
      status: 'SUBMITTED_TO_HOD',
      subjectsJson,
    },
  });

  return report;
};

/**
 * HOD / CC Review and Approval Action
 */
export const reviewWeeklyReport = async (
  reportId: string,
  action: 'APPROVE' | 'RETURN',
  reviewerName: string,
  remarks?: string
) => {
  const existing = await prisma.consolidatedReport.findUnique({
    where: { id: reportId },
  });

  if (!existing) {
    throw new AppError(`Consolidated report with ID ${reportId} not found`, 404);
  }

  const newStatus = action === 'APPROVE' ? 'APPROVED_BY_HOD' : 'RETURNED_BY_HOD';
  const approvedAt = action === 'APPROVE' ? new Date().toISOString().split('T')[0] : null;

  const updated = await prisma.consolidatedReport.update({
    where: { id: reportId },
    data: {
      status: newStatus,
      hodRemarks: remarks || (action === 'APPROVE' ? 'Approved by HOD' : 'Returned for revision'),
      approvedAt,
    },
  });

  return updated;
};

/**
 * Returns Department-wide summary across all sections for a given week
 */
export const getDepartmentSummary = async (department: string, weekNumber?: number) => {
  const reports = await prisma.consolidatedReport.findMany({
    orderBy: { weekNumber: 'desc' },
  });

  // Filter reports matching department name / sections
  const filtered = reports.filter((r) => {
    if (!department || department === 'ALL') return true;
    return r.classId.toLowerCase().includes(department.toLowerCase());
  });

  const totalClasses = filtered.length;
  const approvedClasses = filtered.filter((r) => r.status === 'APPROVED_BY_HOD').length;
  const pendingClasses = totalClasses - approvedClasses;
  const avgCoverage = totalClasses > 0
    ? Math.round(filtered.reduce((sum, r) => sum + r.overallCoverage, 0) / totalClasses)
    : 0;

  return {
    department,
    weekNumber: weekNumber || 'LATEST',
    totalClasses,
    approvedClasses,
    pendingClasses,
    avgCoverage,
    reports: filtered,
  };
};

// ── MASTER METADATA: 1ST YEAR 8 SECTIONS & HIGHER YEARS MATRIX ──

export const getDepartmentsMatrix = () => {
  return {
    years: [
      {
        id: '1st Year',
        name: '1st Year (All Engineering Branches)',
        description: 'First year engineering batch distributed across 8 sections',
        hasDepartments: false,
        sections: [
          { id: '1st Year SEC-A', code: 'SEC-A', name: 'Section A', branch: 'Computer Science and Engineering (CSE)' },
          { id: '1st Year SEC-B', code: 'SEC-B', name: 'Section B', branch: 'CSE & Computer and Communication Engineering (CCE)' },
          { id: '1st Year SEC-C', code: 'SEC-C', name: 'Section C', branch: 'Information Technology (IT)' },
          { id: '1st Year SEC-D', code: 'SEC-D', name: 'Section D', branch: 'Artificial Intelligence & ML / CSBS' },
          { id: '1st Year SEC-E', code: 'SEC-E', name: 'Section E', branch: 'Aero / Mech / Robotics Engineering' },
          { id: '1st Year SEC-F', code: 'SEC-F', name: 'Section F', branch: 'AIML / ECE / EEE Engineering' },
          { id: '1st Year SEC-G', code: 'SEC-G', name: 'Section G', branch: 'Aero / Mech / Robo / Civil / ECE' },
          { id: '1st Year SEC-H', code: 'SEC-H', name: 'Section H', branch: 'General Engineering & Interdisciplinary' },
        ],
      },
      {
        id: '2nd Year',
        name: '2nd Year',
        hasDepartments: true,
        departments: [
          { id: 'CSE', name: 'Computer Science and Engineering', sections: ['2nd Year CSE-A', '2nd Year CSE-B'] },
          { id: 'IT', name: 'Information Technology', sections: ['2nd Year IT-A', '2nd Year IT-B'] },
          { id: 'AIDS', name: 'Artificial Intelligence and Data Science', sections: ['2nd Year AIDS-A', '2nd Year AIDS-B'] },
          { id: 'ECE', name: 'Electronics and Communication Engineering', sections: ['2nd Year ECE-A', '2nd Year ECE-B'] },
          { id: 'EEE', name: 'Electrical and Electronics Engineering', sections: ['2nd Year EEE-A', '2nd Year EEE-B'] },
          { id: 'MECH', name: 'Mechanical Engineering', sections: ['2nd Year MECH-A', '2nd Year MECH-B'] },
          { id: 'CIVIL', name: 'Civil Engineering', sections: ['2nd Year CIVIL-A'] },
        ],
      },
      {
        id: '3rd Year',
        name: '3rd Year',
        hasDepartments: true,
        departments: [
          { id: 'CSE', name: 'Computer Science and Engineering', sections: ['3rd Year CSE-A', '3rd Year CSE-B'] },
          { id: 'IT', name: 'Information Technology', sections: ['3rd Year IT-A', '3rd Year IT-B'] },
          { id: 'AIDS', name: 'Artificial Intelligence and Data Science', sections: ['3rd Year AIDS-A', '3rd Year AIDS-B'] },
          { id: 'ECE', name: 'Electronics and Communication Engineering', sections: ['3rd Year ECE-A', '3rd Year ECE-B'] },
          { id: 'EEE', name: 'Electrical and Electronics Engineering', sections: ['3rd Year EEE-A', '3rd Year EEE-B'] },
          { id: 'MECH', name: 'Mechanical Engineering', sections: ['3rd Year MECH-A', '3rd Year MECH-B'] },
          { id: 'CIVIL', name: 'Civil Engineering', sections: ['3rd Year CIVIL-A'] },
        ],
      },
      {
        id: '4th Year',
        name: '4th Year',
        hasDepartments: true,
        departments: [
          { id: 'CSE', name: 'Computer Science and Engineering', sections: ['4th Year CSE-A', '4th Year CSE-B'] },
          { id: 'IT', name: 'Information Technology', sections: ['4th Year IT-A', '4th Year IT-B'] },
          { id: 'AIDS', name: 'Artificial Intelligence and Data Science', sections: ['4th Year AIDS-A', '4th Year AIDS-B'] },
          { id: 'ECE', name: 'Electronics and Communication Engineering', sections: ['4th Year ECE-A', '4th Year ECE-B'] },
          { id: 'EEE', name: 'Electrical and Electronics Engineering', sections: ['4th Year EEE-A', '4th Year EEE-B'] },
          { id: 'MECH', name: 'Mechanical Engineering', sections: ['4th Year MECH-A', '4th Year MECH-B'] },
          { id: 'CIVIL', name: 'Civil Engineering', sections: ['4th Year CIVIL-A'] },
        ],
      },
    ],
  };
};
