/**
 * src/middleware/requestLogger.js
 *
 * Why this file exists:
 * Morgan is a popular HTTP request logger for Express.
 * Wrapping it here lets us easily swap the logger library later
 * without touching app.js.
 */

const morgan = require('morgan');
const { NODE_ENV } = require('../config/env');

// 'dev' format prints: METHOD URL STATUS RESPONSE-TIME
// 'combined' is more verbose — useful in production for log aggregators
const requestLogger = morgan(NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = requestLogger;
