import { z } from 'zod';

export const compileReportSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, 'classId is required'),
  weekNumber: z.coerce.number().int().min(1),
  overallCoverage: z.coerce.number().int().min(0).max(100),
  submittedBy: z.string().min(1, 'submittedBy is required'),
  ccRemarks: z.string().optional().default(''),
  status: z
    .enum([
      'PENDING_CC',
      'SUBMITTED_TO_HOD',
      'APPROVED_BY_HOD',
      'SENT_TO_ADMIN',
      'REJECTED_BY_HOD',
      'RETURNED_BY_HOD',
    ])
    .optional()
    .default('SUBMITTED_TO_HOD'),
  subjects: z.any(),
});
