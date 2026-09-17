import { z } from 'zod';

export const allocateSubjectSchema = z.object({
  classId: z.string().optional(),
  class: z.string().optional(),
  subjectCode: z.string().optional(),
  subject: z.string().optional(),
  subjectName: z.string().optional(),
  facultyEmail: z.string().optional(),
  email: z.string().optional(),
  facultyName: z.string().optional(),
  name: z.string().optional(),
  department: z.string().optional().default('Computer Science'),
  password: z.string().optional(),
}).transform((data) => {
  const classId = data.classId || data.class || '';
  const subjectCode = data.subjectCode || data.subject || '';
  const subjectName = data.subjectName || subjectCode;
  const facultyEmail = data.facultyEmail || data.email || '';
  const facultyName = data.facultyName || data.name || facultyEmail.split('@')[0];

  return {
    classId,
    subjectCode,
    subjectName,
    facultyEmail,
    facultyName,
    department: data.department || 'Computer Science',
    password: data.password,
  };
}).refine((data) => data.classId.length > 0, {
  message: 'classId is required',
  path: ['classId'],
}).refine((data) => data.subjectCode.length > 0, {
  message: 'subjectCode is required',
  path: ['subjectCode'],
}).refine((data) => data.facultyEmail.includes('@'), {
  message: 'Valid institutional email is required',
  path: ['facultyEmail'],
});

