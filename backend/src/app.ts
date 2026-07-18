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

// v1 API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/sync', syncRoutes);
app.use('/v1/plans', planRoutes);
app.use('/v1/progress', progressRoutes);
app.use('/v1/extra-hours', extraHoursRoutes);
app.use('/v1/reports', reportRoutes);
app.use('/v1/hod', hodRoutes);
app.use('/v1/principal', principalRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error handling middleware
app.use(errorHandler);

export default app;
