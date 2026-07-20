// Enforces the single response envelope used across the whole API:
// Success -> { success: true, data }
// Error   -> { success: false, error: { message, code } }

export const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({ success: true, data });
};

export const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({
    success: false,
    error: { message, code: code || statusCode },
  });
};