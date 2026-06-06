/**
 * src/utils/apiResponse.js
 *
 * Why this file exists:
 * Ensures ALL successful API responses follow the same shape:
 *   { success: true, message: "...", data: { ... } }
 * Without this, different controllers return different formats,
 * which makes the frontend's job harder and breaks contract testing.
 */

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, data = null, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

module.exports = { sendSuccess, sendCreated };
