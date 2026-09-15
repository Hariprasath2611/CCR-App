import { z } from 'zod';

export const hodDecisionSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  decision: z.enum(['APPROVED', 'RETURNED', 'REJECTED']),
  remarks: z.string().min(1, 'remarks are required'),
  isExtraHour: z.boolean().optional().default(false),
});

export const assignCoordinatorSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
  name: z.string().min(1, 'Faculty Name is required'),
  email: z.string().email('Valid institutional email is required'),
  department: z.string().min(1, 'Department is required'),
  password: z.string().optional(),
});

