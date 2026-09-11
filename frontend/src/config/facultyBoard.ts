export interface CCBoardMember {
  section: string;
  classId: string;
  facultyName: string;
  department: string;
  email: string;
  phone?: string;
  designation: string;
}

export interface HODBoardInfo {
  department: string;
  yearDisplay: string;
  hodName: string;
  email: string;
  designation: string;
  roomNo?: string;
}

export const FIRST_YEAR_HOD: HODBoardInfo = {
  department: 'Engineering Science (1st Year)',
  yearDisplay: '1st Year',
  hodName: 'Dr. SARAVANAN',
  email: 'drsaravanan@ccr.edu',
  designation: 'Head of Department',
  roomNo: 'ES-101',
};

export const FIRST_YEAR_CC_BOARD: CCBoardMember[] = [
  {
    section: 'Section A',
    classId: '1st Year SEC-A',
    facultyName: 'Dr. Karuppaiya',
    department: 'Mathematics',
    email: 'drkaruppaiya@ccr.edu',
    designation: 'Class Coordinator & Associate Professor',
  },
  {
    section: 'Section B',
    classId: '1st Year SEC-B',
    facultyName: 'Mrs. G.Revathi',
    department: 'Physics',
    email: 'mrsgrevathy@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
  {
    section: 'Section C',
    classId: '1st Year SEC-C',
    facultyName: 'Mrs. Gopikha',
    department: 'English',
    email: 'mrsgopikha@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
  {
    section: 'Section D',
    classId: '1st Year SEC-D',
    facultyName: 'Dr. Bhuvaneshwari',
    department: 'Chemistry',
    email: 'drbhuvaneshwari@ccr.edu',
    designation: 'Class Coordinator & Associate Professor',
  },
  {
    section: 'Section E',
    classId: '1st Year SEC-E',
    facultyName: 'Dr. Josphin',
    department: 'Tamil',
    email: 'drjosphin@ccr.edu',
    designation: 'Class Coordinator & Associate Professor',
  },
  {
    section: 'Section F',
    classId: '1st Year SEC-F',
    facultyName: 'Mrs. Jasline',
    department: 'Physics',
    email: 'mrsjasline@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
  {
    section: 'Section G',
    classId: '1st Year SEC-G',
    facultyName: 'Mrs. R.Sumathi',
    department: 'Mathematics',
    email: 'mrsrsumathy@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
];

export const CSE_3RD_YEAR_HOD: HODBoardInfo = {
  department: 'Computer Science and Engineering',
  yearDisplay: '3rd Year CSE',
  hodName: 'Mr. J Lin Eby Chandra',
  email: 'linebychandra@ccr.edu',
  designation: 'Head of Department (CSE)',
  roomNo: 'CSE-301',
};

export const CSE_3RD_YEAR_CC_BOARD: CCBoardMember[] = [
  {
    section: 'Section A',
    classId: '3rd Year CSE-A',
    facultyName: 'Ms. Punitha EM',
    department: 'Computer Science',
    email: 'punitha@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
  {
    section: 'Section B',
    classId: '3rd Year CSE-B',
    facultyName: 'Ms. E Uva Shakthi',
    department: 'Computer Science',
    email: 'uvashakthi@ccr.edu',
    designation: 'Class Coordinator & Assistant Professor',
  },
];

export const getHODForYear = (yearOrDept: string = ''): HODBoardInfo => {
  const text = yearOrDept.toUpperCase();
  if (text.includes('1ST') || text.includes('FIRST') || text.includes('SEC-')) {
    return FIRST_YEAR_HOD;
  }
  return CSE_3RD_YEAR_HOD;
};

export const getCCBoardForYear = (yearOrDept: string = ''): CCBoardMember[] => {
  const text = yearOrDept.toUpperCase();
  if (text.includes('1ST') || text.includes('FIRST') || text.includes('SEC-')) {
    return FIRST_YEAR_CC_BOARD;
  }
  return CSE_3RD_YEAR_CC_BOARD;
};

export const getCCForSection = (classIdOrSection: string = ''): CCBoardMember | undefined => {
  const target = classIdOrSection.toUpperCase().trim();
  
  // Try 1st Year matching first
  const match1st = FIRST_YEAR_CC_BOARD.find(
    (cc) => cc.classId.toUpperCase() === target || target.includes(cc.section.toUpperCase()) || (target.endsWith('SEC-A') && cc.section === 'Section A') || (target.endsWith('SEC-B') && cc.section === 'Section B') || (target.endsWith('SEC-C') && cc.section === 'Section C') || (target.endsWith('SEC-D') && cc.section === 'Section D') || (target.endsWith('SEC-E') && cc.section === 'Section E') || (target.endsWith('SEC-F') && cc.section === 'Section F') || (target.endsWith('SEC-G') && cc.section === 'Section G')
  );
  if (match1st) return match1st;

  // Try CSE 3rd Year matching
  const match3rd = CSE_3RD_YEAR_CC_BOARD.find(
    (cc) => cc.classId.toUpperCase() === target || target.includes(cc.classId.toUpperCase())
  );
  return match3rd;
};
