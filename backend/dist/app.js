"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load env variables
dotenv_1.default.config();
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const extraHoursRoutes_1 = __importDefault(require("./routes/extraHoursRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const hodRoutes_1 = __importDefault(require("./routes/hodRoutes"));
const principalRoutes_1 = __importDefault(require("./routes/principalRoutes"));
const app = (0, express_1.default)();
// Standard Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});
// v1 routes
app.use('/v1/auth', authRoutes_1.default);
app.use('/v1/sync', syncRoutes_1.default);
app.use('/v1/plans', planRoutes_1.default);
app.use('/v1/progress', progressRoutes_1.default);
app.use('/v1/extra-hours', extraHoursRoutes_1.default);
app.use('/v1/reports', reportRoutes_1.default);
app.use('/v1/hod', hodRoutes_1.default);
app.use('/v1/principal', principalRoutes_1.default);
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
exports.default = app;
