/**
 * src/server.js
 *
 * Why this file exists:
 * server.js is the entry point for Node.js. Its only job is to start the HTTP
 * server by calling app.listen(). Keeping it separate from app.js means:
 *   - Tests can import app.js without opening a port
 *   - The startup logic (port binding, shutdown handlers) is in one obvious place
 */

const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');

const server = app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │         Gnxtace API Server              │
  │  Environment : ${NODE_ENV.padEnd(24)}│
  │  Port        : ${String(PORT).padEnd(24)}│
  │  Health      : http://localhost:${PORT}/api/health │
  └─────────────────────────────────────────┘
  `);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
// Handles SIGTERM (Docker stop) and SIGINT (Ctrl+C) gracefully by closing
// the HTTP server before exiting, allowing in-flight requests to finish.
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
