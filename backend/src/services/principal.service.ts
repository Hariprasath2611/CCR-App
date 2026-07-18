import { prisma } from '../lib/prisma';

export const fetchPrincipalAnalyticsData = async () => {
  // 1. Calculate overall coverage across all reports in DB
  const allReports = await prisma.consolidatedReport.findMany();
  const totalReports = allReports.length;

  let institutionalCoverage = 0;
  if (totalReports > 0) {
    const sum = allReports.reduce((acc, r) => acc + r.overallCoverage, 0);
    institutionalCoverage = Math.round(sum / totalReports);
  }

  // 2. Aggregate count of reports statuses
  const pendingCC = await prisma.consolidatedReport.count({ where: { status: 'PENDING_CC' } });
  const submittedHOD = await prisma.consolidatedReport.count({ where: { status: 'SUBMITTED_TO_HOD' } });
  const approvedHOD = await prisma.consolidatedReport.count({ where: { status: 'SENT_TO_ADMIN' } });

  // 3. Get total distinct classes from timetable
  const distinctClasses = await prisma.timetableSlot.findMany({
    select: { classSection: true },
    distinct: ['classSection'],
  });

  const totalClassesCount = distinctClasses.length > 0 ? distinctClasses.length : 1;

  // Department summaries dynamically calculated or structured
  const departmentSummaries = [
    {
      department: 'Computer Science Engineering',
      code: 'CSE',
      coverage: institutionalCoverage > 0 ? institutionalCoverage : 0,
      totalClasses: totalClassesCount,
      pendingReports: submittedHOD,
    },
    {
      department: 'Electronics & Communication',
      code: 'ECE',
      coverage: 0,
      totalClasses: 0,
      pendingReports: 0,
    },
    {
      department: 'Information Technology',
      code: 'IT',
      coverage: 0,
      totalClasses: 0,
      pendingReports: 0,
    },
    {
      department: 'Mechanical Engineering',
      code: 'MECH',
      coverage: 0,
      totalClasses: 0,
      pendingReports: 0,
    },
  ];

  return {
    summary: {
      institutionalCoverage,
      pendingApprovals: submittedHOD + pendingCC,
      completedReports: approvedHOD,
      totalClasses: totalClassesCount,
    },
    departments: departmentSummaries,
  };
};
