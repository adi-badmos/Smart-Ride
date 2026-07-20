import { body } from 'express-validator';

// No `role` field here on purpose — public registration always creates a
// plain "user" account (see auth.service.js). Admin accounts come only
// from the seed script; driver accounts only from admin-creation (Phase 4)
// or self-service registration (Phase 10) — never from this endpoint.
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];