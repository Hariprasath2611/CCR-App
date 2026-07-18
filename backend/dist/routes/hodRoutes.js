"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hod_controller_1 = require("../controllers/hod.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const hod_schema_1 = require("../validators/hod.schema");
const router = (0, express_1.Router)();
// Restrict all HOD routes to HOD or ADMIN role
router.use(auth_1.authenticateToken, (0, authorize_1.authorize)('HOD', 'ADMIN'));
router.get('/classes', hod_controller_1.getDepartmentClasses);
router.post('/decision', (0, validate_1.validateBody)(hod_schema_1.hodDecisionSchema), hod_controller_1.submitDecision);
router.get('/extra-hours', hod_controller_1.getExtraHoursRequests);
exports.default = router;
