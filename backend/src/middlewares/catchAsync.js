// Wraps async route handlers so rejected promises are forwarded to
// Express's error middleware instead of crashing the process.
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};