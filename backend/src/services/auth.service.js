import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ROLES } from '../utils/constants.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// A random jti guarantees every refresh token is unique, even when two
// are issued within the same second — jwt.sign is otherwise deterministic
// (same payload + same iat second + same secret => identical token
// string), which would silently defeat rotation without this.
export const issueTokenPair = async (user) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id, jti: crypto.randomUUID() });
  user.refreshToken = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const user = await User.create({ name, email, password, phone, role: ROLES.USER });
  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
};

// Rotation: every successful refresh issues a brand-new pair and
// overwrites the stored hash immediately. A refresh token can only ever
// be used once — the moment it's used, it stops matching what's on
// record, so a stolen-but-unused copy becomes worthless the instant the
// legitimate client refreshes next.
export const refreshTokens = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie) {
    throw new AppError('No refresh token provided', 401, 'NO_REFRESH_TOKEN');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenFromCookie);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.refreshToken) {
    throw new AppError('Session no longer valid. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const providedHash = hashToken(refreshTokenFromCookie);
  if (providedHash !== user.refreshToken) {
    // Doesn't match what's on record — either it was already rotated out
    // by a legitimate refresh, or it's a stolen/replayed token. Either
    // way, kill the session outright rather than silently ignoring the
    // mismatch and issuing new tokens anyway.
    user.refreshToken = undefined;
    await user.save();
    throw new AppError(
      'Session invalid — possible token reuse detected. Please log in again.',
      401,
      'REFRESH_TOKEN_REUSE'
    );
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
};

export const logoutUser = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie) return;
  try {
    const decoded = verifyRefreshToken(refreshTokenFromCookie);
    await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
  } catch (err) {
    // An expired/garbage token on logout is fine — there's nothing valid
    // server-side for it to reach anyway. Cookies get cleared by the
    // controller regardless of what happens here.
  }
};