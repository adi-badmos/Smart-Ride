import { AppError } from '../utils/AppError.js';
import { catchAsync } from './catchAsync.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/user.model.js';

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new AppError('Invalid or expired session. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new AppError('User no longer exists or is deactivated.', 401));
  }

  req.user = user;
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };