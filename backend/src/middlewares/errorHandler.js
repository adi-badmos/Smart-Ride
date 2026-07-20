import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // Multer throws its own error class (file-too-large, unexpected field,
  // etc.) — it isn't an AppError, so it needs its own branch to avoid
  // falling through to a generic 500 "Something went wrong".
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: { message: err.message, code: 'FILE_UPLOAD_ERROR' },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';
  const code = err.code || statusCode;

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} - ${err.message}`);
  }

  const body = {
    success: false,
    error: { message, code },
  };

  if (env.NODE_ENV === 'development' && !err.isOperational) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
};