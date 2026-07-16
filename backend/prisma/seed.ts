import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with 3rd Year CSE-A details...');

  // 1. Clean up existing data to avoid conflicts
  console.log('Cleaning up existing data...');
  await prisma.consolidatedReport.deleteMany({});
  await prisma.extraHourRequest.deleteMany({});
  await prisma.progressLog.deleteMany({});
  await prisma.weeklyPlan.deleteMany({});
  await prisma.timetableSlot.deleteMany({});
  await prisma.syllabusNode.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash default password
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 3. Seed Users
  const users = [
    {
      email: 'punitha@ccms.edu',
      passwordHash,
      name: 'Ms.Punitha EM',
      role: 'STAFF',
      isClassCoordinator: true,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'linebychandra@ccms.edu',
      passwordHash,
      name: 'Mr.J Lin Eby Chandra',
      role: 'HOD',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'uvashakthi@ccms.edu',
      passwordHash,
      name: 'Ms.E Uva Shakthi',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'faizal@ccms.edu',
      passwordHash,
      name: 'Mr.S Faizal Mukthar Hussain',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'rajalakshmi@ccms.edu',
      passwordHash,
      name: 'Ms.R Rajalakshmi',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'divya@ccms.edu',
      passwordHash,
      name: 'Ms.P Divya',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'arunkamala@ccms.edu',
      passwordHash,
      name: 'Ms.Arun Kamala',
      role: 'STAFF',
      isClassCoordinator: false,
      department: 'Computer Science',
      assignedClassId: '3rd Year CSE-A',
    },
    {
      email: 'principal@ccms.edu',
      passwordHash,
      name: 'Dr. Ramesh',
      role: 'ADMIN',
      isClassCoordinator: false,
      department: 'Administration',
    },
  ];

  console.log('Creating users...');
  const userMap: Record<string, string> = {};
  for (const u of users) {
    const createdUser = await prisma.user.create({
      data: u,
    });
    userMap[createdUser.name] = createdUser.id;
  }

  // 4. Seed Syllabus Nodes
  const syllabusNodes = [
    // CS3591 - Computer Networks
    { id: '1', subjectCode: 'CS3591', unit: 'Unit 1', topicId: 'cs3591_1', topicTitle: 'Finite Automata & Physical Layer' },
    { id: '2', subjectCode: 'CS3591', unit: 'Unit 2', topicId: 'cs3591_2', topicTitle: 'Data Link Layer & Media Access Control' },
    { id: '3', subjectCode: 'CS3591', unit: 'Unit 3', topicId: 'cs3591_3', topicTitle: 'Network Layer Routing & IP Protocols' },
    { id: '4', subjectCode: 'CS3591', unit: 'Unit 4', topicId: 'cs3591_4', topicTitle: 'Transport Layer TCP & UDP Congestion' },
    { id: '5', subjectCode: 'CS3591', unit: 'Unit 5', topicId: 'cs3591_5', topicTitle: 'Application Protocols HTTP, DNS, SMTP' },

    // CS3501 - Compiler Design
    { id: '6', subjectCode: 'CS3501', unit: 'Unit 1', topicId: 'cs3501_1', topicTitle: 'Introduction & Lexical Analysis' },
    { id: '7', subjectCode: 'CS3501', unit: 'Unit 2', topicId: 'cs3501_2', topicTitle: 'Syntax Analysis & Parsing Algorithms' },
    { id: '8', subjectCode: 'CS3501', unit: 'Unit 3', topicId: 'cs3501_3', topicTitle: 'Syntax-Directed Translation Schemes' },
    { id: '9', subjectCode: 'CS3501', unit: 'Unit 4', topicId: 'cs3501_4', topicTitle: 'Intermediate Code & Runtime Storage' },
    { id: '10', subjectCode: 'CS3501', unit: 'Unit 5', topicId: 'cs3501_5', topicTitle: 'Code Generation & Local Optimization' },

    // CB3491 - Cryptography and Cyber Security
    { id: '11', subjectCode: 'CB3491', unit: 'Unit 1', topicId: 'cb3491_1', topicTitle: 'Classical Ciphers & Block Encryption' },
    { id: '12', subjectCode: 'CB3491', unit: 'Unit 2', topicId: 'cb3491_2', topicTitle: 'Public Key Encryption RSA & ECC' },
    { id: '13', subjectCode: 'CB3491', unit: 'Unit 3', topicId: 'cb3491_3', topicTitle: 'Hash Functions, Message Authentication' },
    { id: '14', subjectCode: 'CB3491', unit: 'Unit 4', topicId: 'cb3491_4', topicTitle: 'Digital Signatures & Mutual Trust' },
    { id: '15', subjectCode: 'CB3491', unit: 'Unit 5', topicId: 'cb3491_5', topicTitle: 'Firewalls, Intrusion Systems & Cyber Law' },

    // CS3551 - Distributed Computing
    { id: '16', subjectCode: 'CS3551', unit: 'Unit 1', topicId: 'cs3551_1', topicTitle: 'Foundation Models & Distributed Systems' },
    { id: '17', subjectCode: 'CS3551', unit: 'Unit 2', topicId: 'cs3551_2', topicTitle: 'Interprocess Communication & RPC Engines' },
    { id: '18', subjectCode: 'CS3551', unit: 'Unit 3', topicId: 'cs3551_3', topicTitle: 'Coordination, Mutual Exclusion & Consensus' },
    { id: '19', subjectCode: 'CS3551', unit: 'Unit 4', topicId: 'cs3551_4', topicTitle: 'Consistency Models & Active Replication' },
    { id: '20', subjectCode: 'CS3551', unit: 'Unit 5', topicId: 'cs3551_5', topicTitle: 'Fault Tolerance Recovery & Virtualization' },

    // CCS375 - Web Technologies
    { id: '21', subjectCode: 'CCS375', unit: 'Unit 1', topicId: 'ccs375_1', topicTitle: 'Markup HTML5, Visual Styling & CSS3' },
    { id: '22', subjectCode: 'CCS375', unit: 'Unit 2', topicId: 'ccs375_2', topicTitle: 'Client Scripting JS & DOM Architecture' },
    { id: '23', subjectCode: 'CCS375', unit: 'Unit 3', topicId: 'ccs375_3', topicTitle: 'Server Execution Engines Node & Servlets' },
    { id: '24', subjectCode: 'CCS375', unit: 'Unit 4', topicId: 'ccs375_4', topicTitle: 'Database Connection & Persistent Engines' },
    { id: '25', subjectCode: 'CCS375', unit: 'Unit 5', topicId: 'ccs375_5', topicTitle: 'AJAX Communication & XML Web Services' },

    // CCS370 - UI and UX Design
    { id: '26', subjectCode: 'CCS370', unit: 'Unit 1', topicId: 'ccs370_1', topicTitle: 'UX Foundations & User Research' },
    { id: '27', subjectCode: 'CCS370', unit: 'Unit 2', topicId: 'ccs370_2', topicTitle: 'Wireframing Visual Layout & Styling' },
    { id: '28', subjectCode: 'CCS370', unit: 'Unit 3', topicId: 'ccs370_3', topicTitle: 'Interactive Prototyping Systems' },
    { id: '29', subjectCode: 'CCS370', unit: 'Unit 4', topicId: 'ccs370_4', topicTitle: 'Usability Evaluation & Analytics' },
    { id: '30', subjectCode: 'CCS370', unit: 'Unit 5', topicId: 'ccs370_5', topicTitle: 'Design Principles & Native App Guidelines' },

    // MX3084 - Disaster Management
    { id: '31', subjectCode: 'MX3084', unit: 'Unit 1', topicId: 'mx3084_1', topicTitle: 'Understanding Disasters & Hazard Types' },
    { id: '32', subjectCode: 'MX3084', unit: 'Unit 2', topicId: 'mx3084_2', topicTitle: 'Mitigation Systems & Disaster Cycle' },
    { id: '33', subjectCode: 'MX3084', unit: 'Unit 3', topicId: 'mx3084_3', topicTitle: 'Risk Assessment & Vulnerability Plans' },
    { id: '34', subjectCode: 'MX3084', unit: 'Unit 4', topicId: 'mx3084_4', topicTitle: 'Response Systems Recovery & Rebuilding' },
    { id: '35', subjectCode: 'MX3084', unit: 'Unit 5', topicId: 'mx3084_5', topicTitle: 'Case Studies, Regulations & Cyber Relief' },
  ];

  console.log('Creating syllabus nodes...');
  for (const node of syllabusNodes) {
    await prisma.syllabusNode.create({
      data: node,
    });
  }

  // 5. Seed Timetable Slots for 3rd Year CSE-A
  const timetableSlots = [
    // Monday
    { dayOfWeek: 'Monday', period: 1, subjectCode: 'CS3591', subjectName: 'Computer Networks', classSection: '3rd Year CSE-A', roomNo: 'LH-302', facultyName: 'Ms.E Uva Shakthi' },
    { dayOfWeek: 'Monday', period: 2, subjectCode: 'CS3501', subjectName: 'Compiler Design', classSection: '3rd Year CSE-A', roomNo: 'LH-303', facultyName: 'Mr.J Lin Eby Chandra' },
    { dayOfWeek: 'Monday', period: 3, subjectCode: 'CB3491', subjectName: 'Cryptography and Cyber Security', classSection: '3rd Year CSE-A', roomNo: 'LH-304', facultyName: 'Mr.S Faizal Mukthar Hussain' },
    { dayOfWeek: 'Monday', period: 4, subjectCode: 'CS3551', subjectName: 'Distributed Computing', classSection: '3rd Year CSE-A', roomNo: 'LH-305', facultyName: 'Ms.R Rajalakshmi' },
    { dayOfWeek: 'Monday', period: 5, subjectCode: 'CCS375', subjectName: 'Web Technologies', classSection: '3rd Year CSE-A', roomNo: 'LH-306', facultyName: 'Ms.P Divya' },
    { dayOfWeek: 'Monday', period: 6, subjectCode: 'CCS370', subjectName: 'UI and UX Design', classSection: '3rd Year CSE-A', roomNo: 'LH-307', facultyName: 'Ms.Punitha EM' },
    
    // Tuesday
    { dayOfWeek: 'Tuesday', period: 1, subjectCode: 'CCS370', subjectName: 'UI and UX Design', classSection: '3rd Year CSE-A', roomNo: 'LH-307', facultyName: 'Ms.Punitha EM' },
    { dayOfWeek: 'Tuesday', period: 2, subjectCode: 'MX3084', subjectName: 'Disaster Management', classSection: '3rd Year CSE-A', roomNo: 'LH-308', facultyName: 'Ms.Arun Kamala' },
    { dayOfWeek: 'Tuesday', period: 3, subjectCode: 'CS3591', subjectName: 'Computer Networks', classSection: '3rd Year CSE-A', roomNo: 'LH-302', facultyName: 'Ms.E Uva Shakthi' },
    { dayOfWeek: 'Tuesday', period: 4, subjectCode: 'CS3501', subjectName: 'Compiler Design', classSection: '3rd Year CSE-A', roomNo: 'LH-303', facultyName: 'Mr.J Lin Eby Chandra' },
    { dayOfWeek: 'Tuesday', period: 5, subjectCode: 'CB3491', subjectName: 'Cryptography and Cyber Security', classSection: '3rd Year CSE-A', roomNo: 'LH-304', facultyName: 'Mr.S Faizal Mukthar Hussain' },
    { dayOfWeek: 'Tuesday', period: 6, subjectCode: 'CS3551', subjectName: 'Distributed Computing', classSection: '3rd Year CSE-A', roomNo: 'LH-305', facultyName: 'Ms.R Rajalakshmi' },

    // Wednesday
    { dayOfWeek: 'Wednesday', period: 1, subjectCode: 'CS3551', subjectName: 'Distributed Computing', classSection: '3rd Year CSE-A', roomNo: 'LH-305', facultyName: 'Ms.R Rajalakshmi' },
    { dayOfWeek: 'Wednesday', period: 2, subjectCode: 'CCS375', subjectName: 'Web Technologies', classSection: '3rd Year CSE-A', roomNo: 'LH-306', facultyName: 'Ms.P Divya' },
    { dayOfWeek: 'Wednesday', period: 3, subjectCode: 'CCS370', subjectName: 'UI and UX Design', classSection: '3rd Year CSE-A', roomNo: 'LH-307', facultyName: 'Ms.Punitha EM' },
    { dayOfWeek: 'Wednesday', period: 4, subjectCode: 'MX3084', subjectName: 'Disaster Management', classSection: '3rd Year CSE-A', roomNo: 'LH-308', facultyName: 'Ms.Arun Kamala' },
    { dayOfWeek: 'Wednesday', period: 5, subjectCode: 'CS3591', subjectName: 'Computer Networks', classSection: '3rd Year CSE-A', roomNo: 'LH-302', facultyName: 'Ms.E Uva Shakthi' },
    { dayOfWeek: 'Wednesday', period: 6, subjectCode: 'CS3501', subjectName: 'Compiler Design', classSection: '3rd Year CSE-A', roomNo: 'LH-303', facultyName: 'Mr.J Lin Eby Chandra' },

    // Thursday
    { dayOfWeek: 'Thursday', period: 1, subjectCode: 'CS3501', subjectName: 'Compiler Design', classSection: '3rd Year CSE-A', roomNo: 'LH-303', facultyName: 'Mr.J Lin Eby Chandra' },
    { dayOfWeek: 'Thursday', period: 2, subjectCode: 'CB3491', subjectName: 'Cryptography and Cyber Security', classSection: '3rd Year CSE-A', roomNo: 'LH-304', facultyName: 'Mr.S Faizal Mukthar Hussain' },
    { dayOfWeek: 'Thursday', period: 3, subjectCode: 'CS3551', subjectName: 'Distributed Computing', classSection: '3rd Year CSE-A', roomNo: 'LH-305', facultyName: 'Ms.R Rajalakshmi' },
    { dayOfWeek: 'Thursday', period: 4, subjectCode: 'CCS375', subjectName: 'Web Technologies', classSection: '3rd Year CSE-A', roomNo: 'LH-306', facultyName: 'Ms.P Divya' },
    { dayOfWeek: 'Thursday', period: 5, subjectCode: 'CCS370', subjectName: 'UI and UX Design', classSection: '3rd Year CSE-A', roomNo: 'LH-307', facultyName: 'Ms.Punitha EM' },
    { dayOfWeek: 'Thursday', period: 6, subjectCode: 'CS3591', subjectName: 'Computer Networks', classSection: '3rd Year CSE-A', roomNo: 'LH-302', facultyName: 'Ms.E Uva Shakthi' },

    // Friday
    { dayOfWeek: 'Friday', period: 1, subjectCode: 'CB3491', subjectName: 'Cryptography and Cyber Security', classSection: '3rd Year CSE-A', roomNo: 'LH-304', facultyName: 'Mr.S Faizal Mukthar Hussain' },
    { dayOfWeek: 'Friday', period: 2, subjectCode: 'CS3551', subjectName: 'Distributed Computing', classSection: '3rd Year CSE-A', roomNo: 'LH-305', facultyName: 'Ms.R Rajalakshmi' },
    { dayOfWeek: 'Friday', period: 3, subjectCode: 'CCS375', subjectName: 'Web Technologies', classSection: '3rd Year CSE-A', roomNo: 'LH-306', facultyName: 'Ms.P Divya' },
    { dayOfWeek: 'Friday', period: 4, subjectCode: 'CCS370', subjectName: 'UI and UX Design', classSection: '3rd Year CSE-A', roomNo: 'LH-307', facultyName: 'Ms.Punitha EM' },
    { dayOfWeek: 'Friday', period: 5, subjectCode: 'CS3591', subjectName: 'Computer Networks', classSection: '3rd Year CSE-A', roomNo: 'LH-302', facultyName: 'Ms.E Uva Shakthi' },
    { dayOfWeek: 'Friday', period: 6, subjectCode: 'CS3501', subjectName: 'Compiler Design', classSection: '3rd Year CSE-A', roomNo: 'LH-303', facultyName: 'Mr.J Lin Eby Chandra' },
  ];

  console.log('Creating timetable slots...');
  for (const slot of timetableSlots) {
    const facultyId = userMap[slot.facultyName];
    if (!facultyId) {
      console.warn(`Could not find user ID for faculty name: ${slot.facultyName}`);
      continue;
    }

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
