import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

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

// Standard Middlewares
app.use(cors());
app.use(express.json());

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
