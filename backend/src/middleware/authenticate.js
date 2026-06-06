/**
 * src/middleware/authenticate.js
 *
 * Why this file exists:
 * Protects routes that require a valid access token.
 * Reads the Bearer token from the Authorization header,
 * verifies it with jwt.util, and attaches the decoded payload
 * to req.user so controllers don't have to re-verify.
 *
 * Usage:
 *   router.get('/me', authenticate, authController.me);
 *
 * What it does NOT do:
 * - It does not check roles or permissions (that's a separate authorize middleware)
 * - It does not query the database (token self-contains user id + email)
 */

const { verifyAccessToken } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Expect "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token missing', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify the JWT — throws TokenExpiredError or JsonWebTokenError on failure
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Access token invalid', 401);
  }

  // 3. Attach decoded payload to req — downstream handlers use req.user.id
  req.user = {
    id: decoded.sub,
    email: decoded.email,
  };

  next();
});

module.exports = authenticate;
