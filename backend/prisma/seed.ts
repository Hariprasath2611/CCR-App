import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Hash default password
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 2. Seed Users
  const users = [
    {
      email: 'meena@ccms.edu',
      passwordHash,
      name: 'Dr. Meena Kumari',
      role: 'STAFF',
      isClassCoordinator: true,
      department: 'Computer Science',
      assignedClassId: 'CSE-B',
    },
    {
      email: 'karthick@ccms.edu',
      passwordHash,
      name: 'Prof. Karthick D',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: 'CSE-B',
    },
    {
      email: 'rajesh@ccms.edu',
      passwordHash,
      name: 'Prof. Rajesh K',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: 'CSE-B',
    },
    {
      email: 'anita@ccms.edu',
      passwordHash,
      name: 'Dr. Anita S',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: 'CSE-B',
    },
    {
      email: 'hod@ccms.edu',
      passwordHash,
      name: 'Faculty HOD',
      role: 'HOD',
      isClassCoordinator: false,
      department: 'Computer Science',
    },
    {
      email: 'principal@ccms.edu',
      passwordHash,
      name: 'Faculty Principal',
      role: 'ADMIN',
      isClassCoordinator: false,
      department: 'Administration',
    },
  ];

  console.log('Creating users...');
  const userMap: Record<string, string> = {};
  for (const u of users) {
    let createdUser = await prisma.user.findUnique({
      where: { email: u.email },
    });
    if (!createdUser) {
      createdUser = await prisma.user.create({
        data: u,
      });
    }
    userMap[createdUser.name] = createdUser.id;
  }

  // 3. Seed Syllabus Nodes
  const syllabusNodes = [
    // CS8501 - Theory of Computation
    { id: '1', subjectCode: 'CS8501', unit: 'Unit 1', topicId: '1.1', topicTitle: 'Finite Automata (DFA & NFA)' },
    { id: '2', subjectCode: 'CS8501', unit: 'Unit 2', topicId: '1.2', topicTitle: 'Regular Expressions & Languages' },
    { id: '3', subjectCode: 'CS8501', unit: 'Unit 3', topicId: '1.3', topicTitle: 'Context Free Grammars & Ambiguity' },
    { id: '4', subjectCode: 'CS8501', unit: 'Unit 4', topicId: '1.4', topicTitle: 'Pushdown Automata (PDA)' },
    { id: '5', subjectCode: 'CS8501', unit: 'Unit 5', topicId: '1.5', topicTitle: 'Turing Machines & Decidability' },
    
    // CS8502 - Database Systems
    { id: '6', subjectCode: 'CS8502', unit: 'Unit 1', topicId: 'db1', topicTitle: 'Relational Model & ER Diagrams' },
    { id: '7', subjectCode: 'CS8502', unit: 'Unit 2', topicId: 'db2', topicTitle: 'SQL DDL, DML, and Join Queries' },
    { id: '8', subjectCode: 'CS8502', unit: 'Unit 3', topicId: 'db3', topicTitle: 'Normalization (1NF, 2NF, 3NF, BCNF)' },
    { id: '9', subjectCode: 'CS8502', unit: 'Unit 4', topicId: 'db4', topicTitle: 'Transactions, ACID & Concurrency Control' },
    { id: '10', subjectCode: 'CS8502', unit: 'Unit 5', topicId: 'db5', topicTitle: 'NoSQL Architectures & Indexing' },
    
    // CS8503 - Computer Networks
    { id: '11', subjectCode: 'CS8503', unit: 'Unit 1', topicId: 'cn1', topicTitle: 'OSI & TCP/IP Network Models' },
    { id: '12', subjectCode: 'CS8503', unit: 'Unit 2', topicId: 'cn2', topicTitle: 'IPv4/IPv6 Routing & Subnetting' },
    { id: '13', subjectCode: 'CS8503', unit: 'Unit 3', topicId: 'cn3', topicTitle: 'TCP Flow Control & Congestion Avoidance' },
    { id: '14', subjectCode: 'CS8503', unit: 'Unit 4', topicId: 'cn4', topicTitle: 'Application Protocols (HTTP, DNS, SMTP)' },
    { id: '15', subjectCode: 'CS8503', unit: 'Unit 5', topicId: 'cn5', topicTitle: 'Network Cryptography & Firewalls' },
    
    // CS8504 - OS Principles
    { id: '16', subjectCode: 'CS8504', unit: 'Unit 1', topicId: 'os1', topicTitle: 'Process Management & Multithreading' },
    { id: '17', subjectCode: 'CS8504', unit: 'Unit 2', topicId: 'os2', topicTitle: 'CPU Scheduling (FCFS, SJF, RR)' },
    { id: '18', subjectCode: 'CS8504', unit: 'Unit 3', topicId: 'os3', topicTitle: 'Semaphore Synchronization & Deadlocks' },
    { id: '19', subjectCode: 'CS8504', unit: 'Unit 4', topicId: 'os4', topicTitle: 'Paging, Segmentation & Page Replacement' },
    { id: '20', subjectCode: 'CS8504', unit: 'Unit 5', topicId: 'os5', topicTitle: 'File System & Disk I/O Scheduling' },
  ];

  console.log('Creating syllabus nodes...');
  for (const node of syllabusNodes) {
    const existingNode = await prisma.syllabusNode.findUnique({
      where: { topicId: node.topicId },
    });
    if (!existingNode) {
      await prisma.syllabusNode.create({
        data: node,
      });
    }
  }

  // 4. Seed Timetable Slots
  const timetableSlots = [
    // Monday
    { dayOfWeek: 'Monday', period: 1, subjectCode: 'CS8501', subjectName: 'Theory of Computation', classSection: 'CSE-B', roomNo: 'LH-302', facultyName: 'Dr. Meena Kumari' },
    { dayOfWeek: 'Monday', period: 3, subjectCode: 'CS8502', subjectName: 'Database Systems', classSection: 'CSE-B', roomNo: 'LH-303', facultyName: 'Prof. Karthick D' },
    { dayOfWeek: 'Monday', period: 5, subjectCode: 'CS8503', subjectName: 'Computer Networks', classSection: 'CSE-B', roomNo: 'LH-201', facultyName: 'Prof. Rajesh K' },
    // Tuesday
    { dayOfWeek: 'Tuesday', period: 2, subjectCode: 'CS8502', subjectName: 'Database Systems', classSection: 'CSE-B', roomNo: 'LH-303', facultyName: 'Prof. Karthick D' },
    { dayOfWeek: 'Tuesday', period: 4, subjectCode: 'CS8504', subjectName: 'OS Principles', classSection: 'CSE-B', roomNo: 'Lab 3', facultyName: 'Dr. Anita S' },
    { dayOfWeek: 'Tuesday', period: 6, subjectCode: 'CS8501', subjectName: 'Theory of Computation', classSection: 'CSE-B', roomNo: 'LH-302', facultyName: 'Dr. Meena Kumari' },
    // Wednesday
    { dayOfWeek: 'Wednesday', period: 1, subjectCode: 'CS8503', subjectName: 'Computer Networks', classSection: 'CSE-B', roomNo: 'LH-201', facultyName: 'Prof. Rajesh K' },
    { dayOfWeek: 'Wednesday', period: 3, subjectCode: 'CS8504', subjectName: 'OS Principles', classSection: 'CSE-B', roomNo: 'Lab 3', facultyName: 'Dr. Anita S' },
    { dayOfWeek: 'Wednesday', period: 5, subjectCode: 'CS8502', subjectName: 'Database Systems', classSection: 'CSE-B', roomNo: 'LH-303', facultyName: 'Prof. Karthick D' },
    // Thursday
    { dayOfWeek: 'Thursday', period: 2, subjectCode: 'CS8501', subjectName: 'Theory of Computation', classSection: 'CSE-B', roomNo: 'LH-302', facultyName: 'Dr. Meena Kumari' },
    { dayOfWeek: 'Thursday', period: 4, subjectCode: 'CS8503', subjectName: 'Computer Networks', classSection: 'CSE-B', roomNo: 'LH-201', facultyName: 'Prof. Rajesh K' },
    { dayOfWeek: 'Thursday', period: 6, subjectCode: 'CS8504', subjectName: 'OS Principles', classSection: 'CSE-B', roomNo: 'Lab 3', facultyName: 'Dr. Anita S' },
    // Friday
    { dayOfWeek: 'Friday', period: 1, subjectCode: 'CS8504', subjectName: 'OS Principles', classSection: 'CSE-B', roomNo: 'Lab 3', facultyName: 'Dr. Anita S' },
    { dayOfWeek: 'Friday', period: 3, subjectCode: 'CS8501', subjectName: 'Theory of Computation', classSection: 'CSE-B', roomNo: 'LH-302', facultyName: 'Dr. Meena Kumari' },
    { dayOfWeek: 'Friday', period: 5, subjectCode: 'CS8503', subjectName: 'Computer Networks', classSection: 'CSE-B', roomNo: 'LH-201', facultyName: 'Prof. Rajesh K' },
  ];

  console.log('Creating timetable slots...');
  for (const slot of timetableSlots) {
    const facultyId = userMap[slot.facultyName];
    if (!facultyId) {
      console.warn(`Could not find user ID for faculty name: ${slot.facultyName}`);
      continue;
    }
    
    // Find or create slot based on combination of dayOfWeek, period, classSection
    const existingSlot = await prisma.timetableSlot.findFirst({
      where: {
        dayOfWeek: slot.dayOfWeek,
        period: slot.period,
        classSection: slot.classSection,
      },
    });

    if (existingSlot) {
      await prisma.timetableSlot.update({
        where: { id: existingSlot.id },
        data: {
          subjectCode: slot.subjectCode,
          subjectName: slot.subjectName,
          roomNo: slot.roomNo,
          facultyId,
        },
      });
    } else {
      await prisma.timetableSlot.create({
        data: {
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          subjectCode: slot.subjectCode,
          subjectName: slot.subjectName,
          classSection: slot.classSection,
          roomNo: slot.roomNo,
          facultyId,
        },
      });
    }
  }

  // 5. Seed initial ConsolidatedReport to HOD to display in HOD dashboard
  console.log('Creating mock reports for CC/HOD testing...');
  const existingReport = await prisma.consolidatedReport.findFirst({
    where: { id: 'sample-report-002' }
  });

  const subjectsJson = JSON.stringify([
    { code: 'CS8501', name: 'Theory of Computation', faculty: 'Dr. Meena Kumari', coverage: 80, status: 'Submitted', completedTopicsCount: 8, totalTopicsCount: 10 },
    { code: 'CS8502', name: 'Database Systems', faculty: 'Prof. Karthick D', coverage: 65, status: 'Submitted', completedTopicsCount: 6, totalTopicsCount: 9 },
    { code: 'CS8503', name: 'Computer Networks', faculty: 'Prof. Rajesh K', coverage: 70, status: 'Submitted', completedTopicsCount: 7, totalTopicsCount: 10 },
    { code: 'CS8504', name: 'OS Principles', faculty: 'Dr. Anita S', coverage: 60, status: 'Pending', completedTopicsCount: 5, totalTopicsCount: 8, reasonsForPending: 'Lab hours clashed with exams.', extraHoursRequested: true },
  ]);

  if (!existingReport) {
    await prisma.consolidatedReport.create({
      data: {
        id: 'sample-report-002',
        classId: 'CSE-B',
        weekNumber: 12,
        overallCoverage: 69,
        submittedBy: 'Dr. Meena Kumari (Class Coordinator)',
        submittedAt: '2026-07-05',
        ccRemarks: 'CS8504 faculty is running behind schedule due to lab sessions. Extra hour request raised.',
        status: 'SUBMITTED_TO_HOD',
        subjectsJson,
      }
    });
  }

  console.log('Seeding complete successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
