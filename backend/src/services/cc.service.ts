import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/AppError';
import * as bcrypt from 'bcryptjs';

export interface AllocateSubjectData {
  classId: string;
  subjectCode: string;
  subjectName: string;
  facultyEmail: string;
  facultyName: string;
  department?: string;
  password?: string;
  assignedByCcId: string;
}

export const searchFaculty = async (query: string) => {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const facultyList = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: cleanQuery, mode: 'insensitive' } },
        { name: { contains: cleanQuery, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      role: true,
      isClassCoordinator: true,
      assignedClassId: true,
    },
    take: 10,
  });

  return facultyList;
};

export const allocateSubjectTeacher = async (data: AllocateSubjectData) => {
  const { classId, subjectCode, subjectName, facultyEmail, facultyName, department, password, assignedByCcId } = data;
  const cleanEmail = facultyEmail.toLowerCase().trim();
  const defaultPassword = password || 'CCR@2026!';

  // 1. Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  let createdNewUser = false;

  if (!user) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: facultyName,
        role: 'STAFF',
        department: department || 'Computer Science',
        passwordHash,
      },
    });
    createdNewUser = true;
  }

  // 2. Create or Update SubjectAssignment (Decoupled mapping)
  const existingAssignment = await prisma.subjectAssignment.findFirst({
    where: {
      classId,
      subjectCode,
    },
  });

  let assignment;

  if (existingAssignment) {
    // Re-assign existing subject allocation to this faculty
    assignment = await prisma.subjectAssignment.update({
      where: { id: existingAssignment.id },
      data: {
        facultyId: user.id,
        subjectName,
        assignedByCc: assignedByCcId,
      },
      include: { faculty: true },
    });
  } else {
    // Create new assignment
    assignment = await prisma.subjectAssignment.create({
      data: {
        facultyId: user.id,
        classId,
        subjectCode,
        subjectName,
        assignedByCc: assignedByCcId,
      },
      include: { faculty: true },
    });
  }

  // 3. Update Timetable & Class Mappings
  const updatedSlots = await prisma.timetableSlot.updateMany({
    where: {
      classSection: classId,
      subjectCode,
    },
    data: {
      facultyId: user.id,
      subjectName,
    },
  });

  // If no slots exist yet for this class & subject, create default schedule slots
  if (updatedSlots.count === 0) {
    const defaultSlots = [
      { dayOfWeek: 'Monday', period: 2, roomNo: 'LH-201' },
      { dayOfWeek: 'Wednesday', period: 3, roomNo: 'LH-201' },
      { dayOfWeek: 'Friday', period: 1, roomNo: 'LH-201' },
    ];
    for (const slot of defaultSlots) {
      await prisma.timetableSlot.create({
        data: {
          classSection: classId,
          subjectCode,
          subjectName,
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          roomNo: slot.roomNo,
          facultyId: user.id,
        },
      });
    }
  }

  return {
    status: createdNewUser ? 'NEW_USER' : 'EXISTING_USER_REUSED',
    message: createdNewUser
      ? 'Account created. Temp Credentials: [Email/Password]'
      : 'Added successfully. Credentials unchanged.',
    tempPassword: createdNewUser ? defaultPassword : undefined,
    createdNewUser,
    credentials: createdNewUser
      ? { email: cleanEmail, password: defaultPassword }
      : { email: cleanEmail, note: 'Credentials unchanged. Reused existing profile.' },
    assignment: {
      id: assignment.id,
      classId: assignment.classId,
      subjectCode: assignment.subjectCode,
      subjectName: assignment.subjectName,
      faculty: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    },
  };
};

export const getClassSubjectAllocations = async (classId: string) => {
  const assignments = await prisma.subjectAssignment.findMany({
    where: { classId },
    include: {
      faculty: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      },
    },
    orderBy: { subjectCode: 'asc' },
  });

  // Also query timetable slots or syllabus nodes if available to find subjects
  const timetableSubjects = await prisma.timetableSlot.findMany({
    where: { classSection: classId },
    select: {
      subjectCode: true,
      subjectName: true,
    },
    distinct: ['subjectCode'],
  });

  return {
    classId,
    assignments,
    timetableSubjects,
  };
};

export const removeSubjectAllocation = async (assignmentId: string) => {
  const existing = await prisma.subjectAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!existing) {
    throw new AppError('Subject assignment not found', 404);
  }

  await prisma.subjectAssignment.delete({
    where: { id: assignmentId },
  });

  return { success: true, message: 'Subject assignment removed successfully' };
};
