import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

// Locally, frontend and backend are same-site (different ports on
// localhost) so 'lax' works fine. In production they're on different
// domains (vercel.app vs onrender.com) — that's cross-site, and a
// cross-site XHR/fetch request never sends a SameSite=Lax cookie, only
// SameSite=None. None requires Secure to be set alongside it, which is
// why both are gated on isProd together, not just `secure` alone.
export const accessCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // matches JWT_ACCESS_EXPIRES_IN default (~15 min)
});

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
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