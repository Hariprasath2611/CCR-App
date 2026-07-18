"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_controller_1 = require("../controllers/sync.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/init', auth_1.authenticateToken, sync_controller_1.syncInit);
exports.default = router;
