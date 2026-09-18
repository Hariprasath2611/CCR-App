import { getSectionTemplate, filterNonAcademicSubjects } from '../src/config/sectionTemplates';

describe('Section Templates and Subject Configurations', () => {
  test('Retrieves Section A template correctly for 1st Year', () => {
    const template = getSectionTemplate('1st Year SEC-A');
    expect(template).toBeDefined();
    expect(template.section).toBe('A');
    expect(template.department).toBe('CSE');
    expect(template.subjects.length).toBeGreaterThanOrEqual(7);
  });

  test('Retrieves Section B template correctly for 1st Year', () => {
    const template = getSectionTemplate('1st Year SEC-B');
    expect(template).toBeDefined();
    expect(template.section).toBe('B');
    expect(template.department).toBe('CSE & CCE');
  });

  test('Filters non-academic subjects for formal report submission', () => {
    const mixedSubjects = [
      { code: 'MA25C01', name: 'Applied Calculus', faculty: 'Dr. K', coverage: 80, status: 'Submitted' as const, completedTopicsCount: 4, totalTopicsCount: 5 },
      { code: 'LIB', name: 'LIBRARY', faculty: 'Staff', coverage: 0, status: 'Pending' as const, completedTopicsCount: 0, totalTopicsCount: 1 },
      { code: 'SPORTS', name: 'PHYSICAL EDUCATION', faculty: 'Staff', coverage: 0, status: 'Pending' as const, completedTopicsCount: 0, totalTopicsCount: 1 },
    ];
    const filtered = filterNonAcademicSubjects(mixedSubjects);
    expect(filtered.length).toBe(1);
    expect(filtered[0].code).toBe('MA25C01');
  });
});
