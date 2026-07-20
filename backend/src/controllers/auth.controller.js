import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { registerUser, loginUser, refreshTokens, logoutUser } from '../services/auth.service.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const { user, accessToken, refreshToken } = await registerUser({ name, email, password, phone });
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, 201, { user });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser({ email, password });
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, 200, { user });
});

export const refreshTokenHandler = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await refreshTokens(req.cookies?.refreshToken);
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, 200, { user });
});

export const logout = catchAsync(async (req, res) => {
  await logoutUser(req.cookies?.refreshToken);
  clearAuthCookies(res);
  return sendSuccess(res, 200, { message: 'Logged out successfully' });
});