import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';
import { ROLES } from '../utils/constants.js';

export const registerUser = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.USER, // always — see auth.validator.js comment
  });

  const token = signAccessToken({ id: user._id, role: user.role });
  return { user: user.toSafeObject(), token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const token = signAccessToken({ id: user._id, role: user.role });
  return { user: user.toSafeObject(), token };
};