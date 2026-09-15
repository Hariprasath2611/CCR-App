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

  const classesList = timetableClasses.map((t: { classSection: string }) => t.classSection);
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

  return requests.map((r: any) => ({
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

export interface AssignCoordinatorData {
  classId: string;
  name: string;
  email: string;
  department: string;
  password?: string;
}

export const assignClassCoordinator = async (data: AssignCoordinatorData) => {
  const { classId, name, email, department, password } = data;
  const cleanEmail = email.toLowerCase().trim();
  const defaultPassword = password || 'JEC@CC2026';

  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  let createdNewUser = false;

  if (user) {
    // Update existing user to be Class Coordinator for this class
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        isClassCoordinator: true,
        assignedClassId: classId,
      },
    });
  } else {
    // Create new user
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name,
        role: 'STAFF',
        isClassCoordinator: true,
        department,
        assignedClassId: classId,
        passwordHash,
      },
    });
    createdNewUser = true;
  }

  // Upsert ClassSection
  const existingSection = await prisma.classSection.findFirst({
    where: { name: classId },
  });

  if (existingSection) {
    await prisma.classSection.update({
      where: { id: existingSection.id },
      data: { ccId: user.id },
    });
  } else {
    await prisma.classSection.create({
      data: {
        name: classId,
        department,
        year: classId.includes('3rd') ? '3rd Year' : classId.includes('2nd') ? '2nd Year' : '4th Year',
        section: classId.split('-').pop() || 'A',
        ccId: user.id,
      },
    });
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      assignedClassId: user.assignedClassId,
      isClassCoordinator: user.isClassCoordinator,
    },
    createdNewUser,
    credentials: createdNewUser
      ? { email: cleanEmail, password: defaultPassword }
      : { email: cleanEmail, note: 'User already exists. Linked to class with existing password.' },
  };
};

export const fetchDepartmentCoordinators = async (userDepartment?: string) => {
  // Query all classes and their assigned coordinators
  const classes = await fetchHODClasses(userDepartment);

  const sectionsWithCC = await Promise.all(
    classes.map(async (c) => {
      const ccUser = await prisma.user.findFirst({
        where: {
          assignedClassId: c.classId,
          isClassCoordinator: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      });

      return {
        ...c,
        coordinator: ccUser || null,
      };
    })
  );

  return sectionsWithCC;
};

export const removeCoordinator = async (classId: string) => {
  // Find coordinator for this class
  const ccUser = await prisma.user.findFirst({
    where: { assignedClassId: classId, isClassCoordinator: true },
  });

  if (ccUser) {
    await prisma.user.update({
      where: { id: ccUser.id },
      data: {
        assignedClassId: null,
        isClassCoordinator: false,
      },
    });
  }

  const section = await prisma.classSection.findFirst({
    where: { name: classId },
  });

  if (section) {
    await prisma.classSection.update({
      where: { id: section.id },
      data: { ccId: null },
    });
  }

  return { success: true, message: `Coordinator removed from ${classId}` };
};

