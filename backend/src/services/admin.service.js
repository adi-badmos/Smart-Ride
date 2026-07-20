import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../utils/constants.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

export const listUsers = async (reqQuery = {}) => {
  const { search, isActive } = reqQuery;
  const filter = { role: ROLES.USER };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const { page, limit, skip } = getPagination(reqQuery);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, pagination: buildPaginationMeta(page, limit, total) };
};

export const getUserById = async (userId) => {
  const user = await User.findOne({ _id: userId, role: ROLES.USER });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: ROLES.USER },
    { isActive },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
};