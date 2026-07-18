"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const principal_controller_1 = require("../controllers/principal.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
router.get('/analytics', auth_1.authenticateToken, (0, authorize_1.authorize)('ADMIN', 'HOD'), principal_controller_1.getPrincipalAnalytics);
exports.default = router;
