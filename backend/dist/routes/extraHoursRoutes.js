"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const extraHoursController_1 = require("../controllers/extraHoursController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/request', auth_1.authenticateToken, extraHoursController_1.requestExtraHours);
exports.default = router;
