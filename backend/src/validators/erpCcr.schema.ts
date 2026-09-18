import { z } from 'zod';

export const erpSubmitProgressSchema = z.object({
  id: z.string().optional(),
  facultyId: z.string().optional(),
  facultyName: z.string().optional(),
  facultyEmail: z.string().email().optional(),
  academicYear: z.string().min(1, 'academicYear is required'), // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  department: z.string().min(1, 'department is required'), // e.g. "CSE", "IT", "AIML/CSBS", "General Engineering"
  classId: z.string().min(1, 'classId / section is required'), // e.g. "1st Year SEC-B" or "3rd Year CSE-A"
  subjectCode: z.string().min(1, 'subjectCode is required'),
  subjectName: z.string().min(1, 'subjectName is required'),
  academicWeekNumber: z.coerce.number().int().min(1).max(20),
  fromDate: z.string().min(1, 'fromDate is required'),
  toDate: z.string().min(1, 'toDate is required'),
  unitSelected: z.string().min(1, 'unitSelected is required'), // e.g. "Unit 1"
  temporaryUnit: z.string().nullable().optional(),
  topicsCoveredText: z.string().min(1, 'topicsCoveredText is required'),
  completedOnPlan: z.enum(['YES', 'NO']).default('YES'),
  reasonsForPending: z.string().nullable().optional(),
  periodsPlanned: z.coerce.number().int().min(0),
  periodsHandled: z.coerce.number().int().min(0),
  periodsRequired: z.coerce.number().int().min(0).optional().default(0),
  cumulativePercent: z.string().min(1, 'cumulativePercent is required'), // e.g. "Unit 1 - 75%" or "75%"
  completedTopicIds: z.union([z.string(), z.array(z.string())]).optional().default(''),
  pendingTopicIds: z.union([z.string(), z.array(z.string())]).optional().default(''),
  extraHoursRequested: z.boolean().optional().default(false),
});

export const erpCompileReportSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, 'classId is required'),
  weekNumber: z.coerce.number().int().min(1).max(20),
  compiledBy: z.string().min(1, 'compiledBy is required'),
  ccRemarks: z.string().optional().default(''),
  overallCoverage: z.coerce.number().optional(),
  subjects: z.any().optional(),
});

export const erpReviewReportSchema = z.object({
  reportId: z.string().min(1, 'reportId is required'),
  action: z.enum(['APPROVE', 'RETURN']),
  reviewerName: z.string().min(1, 'reviewerName is required'),
  remarks: z.string().optional().default(''),
});
