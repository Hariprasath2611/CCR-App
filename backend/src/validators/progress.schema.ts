import { z } from 'zod';

export const submitProgressSchema = z.object({
  id: z.string().optional(),
  facultyId: z.string().optional(),
  subjectCode: z.string().min(1, 'subjectCode is required'),
  classId: z.string().min(1, 'classId is required'),
  academicWeekNumber: z.coerce.number().int().min(1),
  completedTopicIds: z.union([z.string(), z.array(z.string())]),
  pendingTopicIds: z.union([z.string(), z.array(z.string())]).optional(),
  reasonsForPending: z.string().nullable().optional(),
  extraHoursRequested: z.boolean().optional().default(false),
  submittedAt: z.string().optional(),
  periodsPlanned: z.coerce.number().int().nullable().optional(),
  periodsHandled: z.coerce.number().int().nullable().optional(),
  periodsRequired: z.coerce.number().int().nullable().optional(),
  topicsCoveredText: z.string().nullable().optional(),
  fromDate: z.string().nullable().optional(),
  toDate: z.string().nullable().optional(),
  cumulativePercent: z.string().nullable().optional(),
});
