import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

// Route imports
import authRoutes from './routes/authRoutes';
import syncRoutes from './routes/syncRoutes';
import planRoutes from './routes/planRoutes';
import progressRoutes from './routes/progressRoutes';
import extraHoursRoutes from './routes/extraHoursRoutes';
import reportRoutes from './routes/reportRoutes';
import hodRoutes from './routes/hodRoutes';
import principalRoutes from './routes/principalRoutes';
import ccRoutes from './routes/ccRoutes';
import erpRoutes from './routes/erpRoutes';
import appReleaseRoutes from './routes/appReleaseRoutes';
import adminReleaseRoutes from './routes/adminReleaseRoutes';

const app = express();


// Security & Standard Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check with database connection check
app.get('/health', async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({ status: 'UP', database: 'CONNECTED', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ status: 'DEGRADED', database: 'DISCONNECTED', error: err.message });
  }
});

// Create unified v1 router
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/sync', syncRoutes);
v1Router.use('/plans', planRoutes);
v1Router.use('/progress', progressRoutes);
v1Router.use('/extra-hours', extraHoursRoutes);
v1Router.use('/reports', reportRoutes);
v1Router.use('/hod', hodRoutes);
v1Router.use('/principal', principalRoutes);
v1Router.use('/cc', ccRoutes);
v1Router.use('/erp', erpRoutes);
v1Router.use('/app', appReleaseRoutes);
v1Router.use('/admin', adminReleaseRoutes);

// Mount under canonical /api/v1 AND backward-compatible /v1 alias
app.use('/api/v1', v1Router);
app.use('/v1', v1Router);
app.use('/api/erp', erpRoutes);


// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error handling middleware
app.use(errorHandler);

export default app;
