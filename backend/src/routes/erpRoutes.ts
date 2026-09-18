import { Router } from 'express';
import * as erpCcrController from '../controllers/erpCcr.controller';
import { validateBody } from '../middleware/validate';
import {
  erpSubmitProgressSchema,
  erpCompileReportSchema,
  erpReviewReportSchema,
} from '../validators/erpCcr.schema';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

// Master Hierarchy
router.get('/ccr/departments-matrix', erpCcrController.getDepartmentsMatrix);

// Course Coverage Progress Logging (Algorithm 1)
router.post(
  '/ccr/submit-log',
  optionalAuth,
  validateBody(erpSubmitProgressSchema),
  erpCcrController.submitLog
);

// Class Weekly Consolidated Report (Algorithm 2)
router.get('/ccr/class-report/:classId/week/:weekNumber', erpCcrController.getClassReport);

// Compile / Freeze Weekly Report
router.post(
  '/ccr/compile-weekly',
  optionalAuth,
  validateBody(erpCompileReportSchema),
  erpCcrController.compileWeekly
);

// Review & Approval (HOD/CC action)
router.put(
  '/ccr/review-report',
  optionalAuth,
  validateBody(erpReviewReportSchema),
  erpCcrController.reviewReport
);

// Department Analytics Summary
router.get('/ccr/dept-summary/:department', erpCcrController.getDeptSummary);

export default router;
