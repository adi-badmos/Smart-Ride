import { env } from '../config/env.js';

// Centralized so auth.controller.js and driver.controller.js (self-service
// registration also issues a session) can't drift out of sync on maxAge
// or flags.
export const accessCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // matches JWT_ACCESS_EXPIRES_IN default (~15 min)
});

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // matches JWT_REFRESH_EXPIRES_IN default (~7 days)
});

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, accessCookieOptions());
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', accessCookieOptions());
  res.clearCookie('refreshToken', refreshCookieOptions());
};