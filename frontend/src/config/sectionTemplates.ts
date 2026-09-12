export interface TemplateSubjectItem {
  sNo: number;
  subjectCode: string;
  subjectName: string;
  staffInCharge: string;
  periodsPlannedDefault?: number;
}

export interface SectionTemplateConfig {
  section: string;
  department: string;
  academicYear: string;
  semester: string;
  subjects: TemplateSubjectItem[];
}

export const SECTION_TEMPLATES: Record<string, SectionTemplateConfig> = {
  // Section A Template (CSE)
  'SEC-A': {
    section: 'A',
    department: 'CSE',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'Dr. KARUPPAIYA', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. Gopikha', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Dr. SARAVANAN', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. Bhuvaneshwari', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'Mrs. Agnus', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'Mrs. Archana', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. D.SIVAKUMAR', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Mr. D.SIVAKUMAR & Mrs. BHAKYALAKSHMI', periodsPlannedDefault: 2 },
    ],
  },

  // Section B Template (CSE & CCE)
  'SEC-B': {
    section: 'B',
    department: 'CSE & CCE',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'New Staff', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. A.Vani Berlina', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Mrs. G.Revathi', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. C.Murugesan', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'Mrs. Agnus', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'New Staff', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Dr. GOPIKUMAR & Mrs. KANAGAVALLI', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM', periodsPlannedDefault: 2 },
    ],
  },

  // Section C Template (IT)
  'SEC-C': {
    section: 'C',
    department: 'IT',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'Mr. SRINIVASAN', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. S.Gopikha', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Mrs. Jasline', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. A.Yoganath', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'Mrs. Agnus', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'New Staff', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. KUMARASAMY & Mrs. VYSHNAVAI', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM', periodsPlannedDefault: 2 },
    ],
  },

  // Section D Template (AIML/CSBS)
  'SEC-D': {
    section: 'D',
    department: 'AIML/CSBS',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'Mrs. KAVITHA', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. A.VANI BERLINA', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Dr. THIRUGNANAM', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. BHUVANESHWARI', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'New Staff', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'Mrs. Merlin', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. KUMARASAMY & Mrs. VYSHNAVAI', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM', periodsPlannedDefault: 2 },
    ],
  },

  // Section E Template (Aero/Mech/Robo)
  'SEC-E': {
    section: 'E',
    department: 'Aero/Mech/Robo',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'APPLIED CALCULUS', staffInCharge: 'NEW STAFF', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'EN25C01', subjectName: 'ENGLISH ESSENTIALS-I', staffInCharge: 'Mr. ARAVIND/AP/ENG', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'HERITAGE OF TAMILS', staffInCharge: 'Dr. JOSPHIN/AP/TAMIL', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'APPLIED PHYSICS-I', staffInCharge: 'Dr. THIRUGNANAM/AP/PHY', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'APPLIED CHEMISTRY-I', staffInCharge: 'Dr. C.MURUGESAN/Prof/CHEM', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C02', subjectName: 'COMPUTER PROGRAMMING:PYTHON', staffInCharge: 'Mrs. ARCHANA/AP/CSE', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'ME25C01', subjectName: 'ENGINEERING DRAWING', staffInCharge: 'Dr. KALAIMANI/AP/MECH', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C03', subjectName: 'INTRODUCTION TO MECHANICAL ENGINEERING', staffInCharge: 'Mr. VIJAYAKUMAR/AP/MECH', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'CE25C01', subjectName: 'INTRODUCTION TO CIVIL ENGINEERING', staffInCharge: 'Dr. GOPIKUMAR/AP/CIVIL', periodsPlannedDefault: 3 },
      { sNo: 10, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. KALAIMANI/AP/MECH & Ms. KANAGAVALLI/AP/EEE', periodsPlannedDefault: 3 },
      { sNo: 11, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM/AP/PHY', periodsPlannedDefault: 1 },
    ],
  },

  // Section F Template (AIML/ECE/EEE)
  'SEC-F': {
    section: 'F',
    department: 'AIML/ECE/EEE',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'Mr. SRINIVASAN', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. S.Gopikha', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Mrs. Jasline', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. A.Yoganath', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'Mrs. Agnus', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'New Staff', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. KUMARASAMY & Mrs. VYSHNAVAI', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM', periodsPlannedDefault: 2 },
    ],
  },

  // Section G Template (Aero/Mech/Robo/Civil/ECE/EEE)
  'SEC-G': {
    section: 'G',
    department: 'Aero/Mech/Robo/Civil/ECE',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'APPLIED CALCULUS', staffInCharge: 'Mrs. R.SUMATHI/AP/MATHS', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'EN25C01', subjectName: 'ENGLISH ESSENTIALS-I', staffInCharge: 'Mrs. GOPHIKA/AP/ENG', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'HERITAGE OF TAMILS', staffInCharge: 'Dr. JOSPHIN/AP/TAMIL', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'APPLIED PHYSICS-I', staffInCharge: 'Dr. S.REVATHI/AP/PHY', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'APPLIED CHEMISTRY-I', staffInCharge: 'Dr. A.YOGANATH/AP/CHEM', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'COMPUTER PROGRAMMING: C', staffInCharge: 'NEW STAFF', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'EE25C04', subjectName: 'BASIC ELECTRONICS AND ELECTRICAL ENGINEERING', staffInCharge: 'Mr. KUMARASWAMY/AP/EEE', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mrs. VYSHNAVAI & Mrs. ASHWINI', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Dr. THIRUGNANAM/AP/PHY', periodsPlannedDefault: 1 },
    ],
  },
};

/**
 * Filter out Physical Education and Library Hour from any subject list
 */
export const filterNonAcademicSubjects = <T extends { subjectName?: string; name?: string }>(subjects: T[]): T[] => {
  return subjects.filter((s) => {
    const name = (s.subjectName || s.name || '').toUpperCase();
    const isPhysicalEdu = name.includes('PHYSICAL EDUCATION') || name.includes('SPORTS') || name.includes('PHYSICAL EDU');
    const isLibrary = name.includes('LIBRARY');
    return !isPhysicalEdu && !isLibrary;
  });
};

/**
 * Get section template configuration based on class ID (e.g. '1st Year SEC-A' -> 'SEC-A')
 */
export const getSectionTemplate = (classId: string): SectionTemplateConfig => {
  const upper = classId.toUpperCase();
  let template: SectionTemplateConfig;

  if (upper.includes('SEC-A') || upper.includes('SEC A') || upper.endsWith(' A')) template = SECTION_TEMPLATES['SEC-A'];
  else if (upper.includes('SEC-B') || upper.includes('SEC B') || upper.endsWith(' B')) template = SECTION_TEMPLATES['SEC-B'];
  else if (upper.includes('SEC-C') || upper.includes('SEC C') || upper.endsWith(' C')) template = SECTION_TEMPLATES['SEC-C'];
  else if (upper.includes('SEC-D') || upper.includes('SEC D') || upper.endsWith(' D')) template = SECTION_TEMPLATES['SEC-D'];
  else if (upper.includes('SEC-E') || upper.includes('SEC E') || upper.endsWith(' E')) template = SECTION_TEMPLATES['SEC-E'];
  else if (upper.includes('SEC-F') || upper.includes('SEC F') || upper.endsWith(' F')) template = SECTION_TEMPLATES['SEC-F'];
  else if (upper.includes('SEC-G') || upper.includes('SEC G') || upper.endsWith(' G')) template = SECTION_TEMPLATES['SEC-G'];
  else template = SECTION_TEMPLATES['SEC-A'];

  return {
    ...template,
    subjects: filterNonAcademicSubjects(template.subjects).map((s, idx) => ({
      ...s,
      sNo: idx + 1,
    })),
  };
};
