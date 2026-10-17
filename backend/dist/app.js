"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cors_2 = require("./config/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const prisma_1 = require("./lib/prisma");
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const extraHoursRoutes_1 = __importDefault(require("./routes/extraHoursRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const hodRoutes_1 = __importDefault(require("./routes/hodRoutes"));
const principalRoutes_1 = __importDefault(require("./routes/principalRoutes"));
const ccRoutes_1 = __importDefault(require("./routes/ccRoutes"));
const erpRoutes_1 = __importDefault(require("./routes/erpRoutes"));
const appReleaseRoutes_1 = __importDefault(require("./routes/appReleaseRoutes"));
const adminReleaseRoutes_1 = __importDefault(require("./routes/adminReleaseRoutes"));
const app = (0, express_1.default)();
// Security & Standard Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check with database connection check
app.get('/health', async (req, res) => {
    try {
        await prisma_1.prisma.$runCommandRaw({ ping: 1 });
        res.json({ status: 'UP', database: 'CONNECTED', timestamp: new Date().toISOString() });
    }
    catch (err) {
        res.status(500).json({ status: 'DEGRADED', database: 'DISCONNECTED', error: err.message });
    }
});
// Create unified v1 router
const v1Router = express_1.default.Router();
v1Router.use('/auth', authRoutes_1.default);
v1Router.use('/sync', syncRoutes_1.default);
v1Router.use('/plans', planRoutes_1.default);
v1Router.use('/progress', progressRoutes_1.default);
v1Router.use('/extra-hours', extraHoursRoutes_1.default);
v1Router.use('/reports', reportRoutes_1.default);
v1Router.use('/hod', hodRoutes_1.default);
v1Router.use('/principal', principalRoutes_1.default);
v1Router.use('/cc', ccRoutes_1.default);
v1Router.use('/erp', erpRoutes_1.default);
v1Router.use('/app', appReleaseRoutes_1.default);
v1Router.use('/admin', adminReleaseRoutes_1.default);
// Mount under canonical /api/v1 AND backward-compatible /v1 alias
app.use('/api/v1', v1Router);
app.use('/v1', v1Router);
app.use('/api/erp', erpRoutes_1.default);
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
