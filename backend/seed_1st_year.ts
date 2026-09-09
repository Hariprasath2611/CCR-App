import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility to parse faculty name and department from the string
const parseFacultyInfo = (rawStr: string) => {
  const parts = rawStr.split('/');
  const name = parts[0].trim();
  const department = parts.length > 2 ? parts[2].trim() : (parts.length > 1 ? parts[1].trim() : 'S&H');
  return { name, department };
};

const classData = [
  {
    section: '1st Year Sec-A',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'Dr.KARUPPAIYA/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mrs.GOPIKHA/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Dr.SARAVANAN/PROF/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.BHUVANESHWARI/AP/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'Mrs.AGNUS/AP/CSE' },
      { code: 'CS25C03', name: 'ESSENTIALS OF COMPUTING', faculty: 'Mrs.ARCHANA/AP/CSE' },
      { code: 'E25C16', name: 'MAKERSPACE', faculty: 'Mr.D.SIVAKUMAR/AP/MECH' },
      { code: 'E25C16', name: 'MAKERSPACE', faculty: 'Mrs.BHAKYALAKSHMI/AP/ECE' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.SARAVANAN/PROF/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-B',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'NEW STAFF/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mrs.A.VANI BERLINA/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Mrs.REVATHY/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.C.MURUGESAN/Prof/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'Mrs.AGNUS/AP/CSE' },
      { code: 'CS25C03', name: 'ESSENTIALS OF COMPUTING', faculty: 'NEW STAFF/AP/CSE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Dr.GOPIKUMAR/AP/CIVIL' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.KANAGAVALLI/AP/EEE' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-C',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'Mr.SRINIVASAN/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mrs.GOPHIKA/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Mrs.JASLINE/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.A.YOGANATH/ASP/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'Mrs.AGNUS/AP/CSE' },
      { code: 'CS25C03', name: 'ESSENTIALS OF COMPUTING', faculty: 'NEW STAFF2/AP/CSE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Dr.KALAIMANI/AP/MECH' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-D',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'Mrs.KAVITHA/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mrs.A.VANI BERLIN/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.BHUVANESHWARI/AP/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'NEW STAFF3/AP/CSE' },
      { code: 'CS25C03', name: 'ESSENTIALS OF COMPUTING', faculty: 'NEW STAFF4/AP/CSE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mr.KUMARASAMY/AP/EEE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.VYSHNAVAI/AP/CIVIL' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-E',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'NEW STAFF5/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mr.ARAVIND/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.C.MURUGESAN/Prof/CHEM' },
      { code: 'CS25C02', name: 'COMPUTER PROGRAMMING:PYTHON', faculty: 'Mrs.ARCHANA/AP/CSE' },
      { code: 'ME25C01', name: 'ENGINEERING DRAWING', faculty: 'Dr.KALAIMANI/AP/MECH' },
      { code: 'ME25C03', name: 'INTRODUCTION TO MECHANICAL ENGINEERING', faculty: 'Mr.VIJAYAKUMAR/AP/MECH' },
      { code: 'CE25C01', name: 'INTRODUCTION TO CIVIL ENGINEERING', faculty: 'Dr.GOPIKUMAR/AP/CIVIL' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mr.KALAIMANII/AP/MECH' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.KANAGAVALLI/AP/EEE' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-F',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'NEW STAFF6/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mr.ARAVIND/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Mrs.JASLINE/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.BHUVANESHWARI/AP/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'Mrs.AGNUS/AP/CSE' },
      { code: 'CS25C02', name: 'COMPUTER PROGRAMMING:PYTHON', faculty: 'Mrs.ARCHANA/AP/CSE' },
      { code: 'EE25C03', name: 'FUNDAMENTALS OF ELEC & ELEC ENG', faculty: 'Mrs.AMUDHA/AP/ECE' },
      { code: 'TT25C01', name: 'INTRODUCTION TO TEXTILE TECH', faculty: 'MS.GOPHIKA/AP/TEX' },
      { code: 'EI25C01', name: 'INTRODUCTION TO MEASUREMENT', faculty: 'Mr.KUMARASWAMY/AP/EEE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Dr.GOPIKUMAR/AP/CIVIL' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.AMUDHA/AP/EEE' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  },
  {
    section: '1st Year Sec-G',
    slots: [
      { code: 'MA25C01', name: 'APPLIED CALCULUS', faculty: 'Mrs.R.SUMATHY/AP/MATHS' },
      { code: 'EN25C01', name: 'ENGLISH ESSENTIALS-I', faculty: 'Mrs.GOPHIKA/AP/ENG' },
      { code: 'UC25H01', name: 'HERITAGE OF TAMILS', faculty: 'Dr.JOSPHIN/AP/TAMIL' },
      { code: 'PH25C01', name: 'APPLIED PHYSICS-I', faculty: 'Mrs.G.REVATHY/AP/PHY' },
      { code: 'CY25C01', name: 'APPLIED CHEMISTRY-I', faculty: 'Dr.A.YOGANATH/ASP/CHEM' },
      { code: 'CS25C01', name: 'COMPUTER PROGRAMMING:C', faculty: 'NEW STAFF7/AP/CSE' },
      { code: 'EE25C04', name: 'BASIC ELECTRONICS AND ELECTRICAL ENG', faculty: 'Mr.KUMARASWAMY/AP/EEE' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.VYSHNAVAI/AP/CIVIL' },
      { code: 'ME25C16', name: 'MAKERSPACE', faculty: 'Mrs.ASHWINI/AP/ECE' },
      { code: 'UC25A01', name: 'LIFE SKILLS FOR ENGINEERS-I', faculty: 'Dr.THIRUGNANAM/AP/PHY' },
      { code: 'UC25A02', name: 'PHYSICAL EDUCATION-I', faculty: 'Ms.SABISHNA/PD' }
    ]
  }
];

async function seed() {
  console.log('Starting seed...');
  
  for (const c of classData) {
    for (const slot of c.slots) {
      const { name: facName, department } = parseFacultyInfo(slot.faculty);
      
      // Upsert User
      let user = await prisma.user.findFirst({ where: { name: facName, role: 'STAFF' } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: `${facName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@cc.edu`,
            passwordHash: 'hashed_password', // Mock password
            name: facName,
            role: 'STAFF',
            department: department,
            isClassCoordinator: false
          }
        });
      }

      // Check if slot exists
      const existingSlot = await prisma.timetableSlot.findFirst({
        where: {
          subjectCode: slot.code,
          classSection: c.section,
          facultyId: user.id
        }
      });

      if (!existingSlot) {
        await prisma.timetableSlot.create({
          data: {
            dayOfWeek: 'Monday', // Mock day
            period: 1, // Mock period
            subjectCode: slot.code,
            subjectName: slot.name,
            classSection: c.section,
            roomNo: 'SH-101', // Mock room
            facultyId: user.id
          }
        });
      }
    }
  }
  
  // Now fetch and output
  const staff = await prisma.user.findMany({
    where: { role: 'STAFF' },
    include: { timetableSlots: true }
  });

  const facultyData = staff
    .filter(faculty => faculty.timetableSlots.some(s => s.classSection.includes('1st Year')))
    .map(faculty => {
      const sections = Array.from(new Set(faculty.timetableSlots.map(s => s.classSection)));
      const subjects = Array.from(new Set(faculty.timetableSlots.map(s => `${s.subjectCode} - ${s.subjectName}`)));
      
      return {
        Name: faculty.name,
        Department: faculty.department,
        Sections: sections.join(', ') || '-',
        Subjects: subjects.join(', ') || '-',
      };
    });

  console.log(JSON.stringify(facultyData, null, 2));
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
