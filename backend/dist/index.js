"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const PORT = env_1.config.port;
const server = app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`  CCR API Server running on port ${PORT} `);
    console.log(`  Environment: ${env_1.config.nodeEnv}          `);
    console.log(`  Listening on http://0.0.0.0:${PORT}    `);
    console.log(`========================================`);
});
// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
        console.log('HTTP server closed.');
        await prisma_1.prisma.$disconnect();
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
