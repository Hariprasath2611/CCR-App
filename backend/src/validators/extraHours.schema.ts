import { z } from 'zod';

export const requestExtraHoursSchema = z.object({
  id: z.string().optional(),
  facultyId: z.string().optional(),
  subjectCode: z.string().min(1, 'subjectCode is required'),
  classId: z.string().min(1, 'classId is required'),
  requestedDate: z.string().min(1, 'requestedDate is required'),
  period: z.coerce.number().int().min(1).max(10),
  reason: z.string().min(1, 'reason is required'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().default('PENDING'),
});
