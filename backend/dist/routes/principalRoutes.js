"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const principalController_1 = require("../controllers/principalController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/analytics', auth_1.authenticateToken, principalController_1.getPrincipalAnalytics);
exports.default = router;
