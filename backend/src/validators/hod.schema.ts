import { z } from 'zod';

export const hodDecisionSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  decision: z.enum(['APPROVED', 'RETURNED', 'REJECTED']),
  remarks: z.string().min(1, 'remarks are required'),
  isExtraHour: z.boolean().optional().default(false),
});
