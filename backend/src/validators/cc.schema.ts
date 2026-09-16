import { z } from 'zod';

export const allocateSubjectSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
  subjectCode: z.string().min(1, 'subjectCode is required'),
  subjectName: z.string().min(1, 'subjectName is required'),
  facultyEmail: z.string().email('Valid institutional email is required'),
  facultyName: z.string().min(1, 'Faculty Name is required'),
  department: z.string().optional().default('General'),
  password: z.string().optional(),
});
