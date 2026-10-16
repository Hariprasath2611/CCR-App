import { getCCForSection } from './facultyBoard';

export interface FacultyCourseTemplate {
  code: string;
  name: string;
  section: string;
  yearPrefix: string;
  roomNo?: string;
  shortName: string;
  facultyName: string;
  facultyEmail: string;
}

export const ALL_FACULTY_COURSES: FacultyCourseTemplate[] = [
  // 3rd Year CSE-A
  {
    code: 'CCS370',
    name: 'UI and UX Design',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-307',
    shortName: 'UI/UX',
    facultyName: 'Ms. Punitha EM',
    facultyEmail: 'punitha@ccms.edu',
  },
  {
    code: 'CS3501',
    name: 'Compiler Design',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-303',
    shortName: 'CD',
    facultyName: 'Mr. J Lin Eby Chandra',
    facultyEmail: 'linebychandra@ccms.edu',
  },
  {
    code: 'CS3591',
    name: 'Computer Networks',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-302',
    shortName: 'CN',
    facultyName: 'Ms. E Uva Shakthi',
    facultyEmail: 'uvashakthi@ccms.edu',
  },
  {
    code: 'CB3491',
    name: 'Cryptography and Cyber Security',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-304',
    shortName: 'CCS',
    facultyName: 'Mr. S Faizal Mukthar Hussain',
    facultyEmail: 'faizal@ccms.edu',
  },
  {
    code: 'CS3551',
    name: 'Distributed Computing',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-305',
    shortName: 'DC',
    facultyName: 'Ms. R Rajalakshmi',
    facultyEmail: 'rajalakshmi@ccms.edu',
  },
  {
    code: 'CCS375',
    name: 'Web Technologies',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-306',
    shortName: 'WT',
    facultyName: 'Ms. P Divya',
    facultyEmail: 'divya@ccms.edu',
  },
  {
    code: 'MX3084',
    name: 'Disaster Management',
    section: '3rd Year CSE-A',
    yearPrefix: '3rd Year CSE',
    roomNo: 'LH-308',
    shortName: 'DM',
    facultyName: 'Ms. Arun Kamala',
    facultyEmail: 'arunkamala@ccms.edu',
  },

  // 1st Year Engineering
  {
    code: 'MA25C01',
    name: 'Applied Calculus',
    section: '1st Year SEC-A',
    yearPrefix: '1st Year',
    roomNo: 'LH-10A',
    shortName: 'CALC',
    facultyName: 'Dr. Karuppaiya',
    facultyEmail: 'drkaruppaiya@ccr.edu',
  },
  {
    code: 'PH25C01',
    name: 'Applied Physics-I',
    section: '1st Year SEC-A',
    yearPrefix: '1st Year',
    roomNo: 'LH-10A',
    shortName: 'PHY',
    facultyName: 'Dr. Saravanan',
    facultyEmail: 'drsaravanan@ccr.edu',
  },
  {
    code: 'EN25C01',
    name: 'English Essentials-I',
    section: '1st Year SEC-C',
    yearPrefix: '1st Year',
    roomNo: 'LH-10C',
    shortName: 'ENG',
    facultyName: 'Mrs. Gopikha',
    facultyEmail: 'mrsgopikha@ccr.edu',
  },
  {
    code: 'UC25H01',
    name: 'Heritage of Tamils',
    section: '1st Year SEC-E',
    yearPrefix: '1st Year',
    roomNo: 'LH-10E',
    shortName: 'TAM',
    facultyName: 'Dr. Josphin',
    facultyEmail: 'drjosphin@ccr.edu',
  },
  {
    code: 'CY25C01',
    name: 'Applied Chemistry-I',
    section: '1st Year SEC-D',
    yearPrefix: '1st Year',
    roomNo: 'LH-10D',
    shortName: 'CHEM',
    facultyName: 'Dr. Bhuvaneshwari',
    facultyEmail: 'drbhuvaneshwari@ccr.edu',
  },
];

/**
 * Returns courses mapped to a faculty member with resilient fuzzy name/email matching.
 * If user is ADMIN or HOD, returns all courses in department.
 */
export const getFallbackCoursesForFaculty = (user: any): FacultyCourseTemplate[] => {
  if (!user) return ALL_FACULTY_COURSES.slice(0, 3);

  if (user.role === 'ADMIN' || user.role === 'HOD') {
    return ALL_FACULTY_COURSES;
  }

  const emailLower = (user.email || '').toLowerCase().trim();
  const nameClean = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const matched = ALL_FACULTY_COURSES.filter((c) => {
    const cEmailLower = c.facultyEmail.toLowerCase();
    const cNameClean = c.facultyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check direct email match or username part match
    const emailPrefix = emailLower.split('@')[0];
    const cEmailPrefix = cEmailLower.split('@')[0];
    if (emailPrefix && cEmailPrefix && emailPrefix === cEmailPrefix) return true;

    // Check name containment
    if (nameClean && cNameClean) {
      if (nameClean.includes(cNameClean) || cNameClean.includes(nameClean)) return true;
    }

    return false;
  });

  if (matched.length > 0) return matched;

  // If user is Class Coordinator for 3rd Year CSE-A, return Punitha's course
  if (user.isClassCoordinator && user.assignedClassId?.includes('3rd Year')) {
    return ALL_FACULTY_COURSES.filter((c) => c.section.includes('3rd Year'));
  }

  // Fallback to first course
  return [ALL_FACULTY_COURSES[0]];
};
