export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}