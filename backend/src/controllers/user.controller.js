import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { updateMyProfile, changeMyPassword } from '../services/user.service.js';

export const getMe = catchAsync(async (req, res) => {
  return sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

export const updateMe = catchAsync(async (req, res) => {
  const { name, phone } = req.body;
  const user = await updateMyProfile(req.user._id, { name, phone });
  return sendSuccess(res, 200, { user });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await changeMyPassword(req.user._id, { currentPassword, newPassword });
  return sendSuccess(res, 200, { user });
});