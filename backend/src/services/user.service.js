import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

export const updateMyProfile = async (userId, { name, phone }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};

export const changeMyPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
  }

  user.password = newPassword;
  await user.save();
  return user.toSafeObject();
};