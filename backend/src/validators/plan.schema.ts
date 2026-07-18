import { z } from 'zod';

export const createPlanSchema = z.object({
  id: z.string().optional(),
  facultyId: z.string().optional(),
  subjectCode: z.string().min(1, 'subjectCode is required'),
  academicWeekNumber: z.coerce.number().int().min(1),
  targetTopicIds: z.union([z.string(), z.array(z.string())]),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']).optional().default('SUBMITTED'),
});
