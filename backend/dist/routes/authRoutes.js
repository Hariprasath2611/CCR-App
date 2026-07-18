"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../validators/auth.schema");
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 login attempts per IP per 15 minutes
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/login', loginLimiter, (0, validate_1.validateBody)(auth_schema_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validate_1.validateBody)(auth_schema_1.refreshSchema), auth_controller_1.refresh);
router.post('/change-password', auth_1.authenticateToken, (0, validate_1.validateBody)(auth_schema_1.changePasswordSchema), auth_controller_1.changePassword);
exports.default = router;
