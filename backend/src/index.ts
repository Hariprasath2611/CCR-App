import app from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`  CCR API Server running on port ${PORT} `);
  console.log(`  Environment: ${config.nodeEnv}          `);
  console.log(`  Listening on http://0.0.0.0:${PORT}    `);
  console.log(`========================================`);
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection disconnected.');
    process.exit(0);
  });

  // Force close after 10s if connections persist
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
