/**
 * src/app.js
 *
 * Why this file exists:
 * app.js configures the Express application — middleware, routes, and error
 * handlers. It is separated from server.js so that the app can be imported in
 * tests without actually starting a TCP listener.
 *
 * Mounting order matters:
 *   1. Security & parsing middleware first
 *   2. Logging middleware
 *   3. Feature routes
 *   4. 404 handler (must come after all routes)
 *   5. Global error handler (must be last, 4 parameters)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { CORS_ORIGIN } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes/index');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(requestLogger);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
