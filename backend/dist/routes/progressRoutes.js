"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progressController_1 = require("../controllers/progressController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/submit', auth_1.authenticateToken, progressController_1.submitProgress);
exports.default = router;
