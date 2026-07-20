import { body } from 'express-validator';

// Used by admin's direct driver-creation endpoint (Phase 4).
export const createDriverRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('licenseExpiry').isISO8601().withMessage('License expiry must be a valid date'),
];

// Used by self-service registration (Phase 10) — same shape as
// createDriverRules but kept separate since the two endpoints have
// different auth contexts (admin-only vs. public) and may diverge later.
export const registerDriverRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('licenseExpiry').isISO8601().withMessage('License expiry must be a valid date'),
];

export const updateDriverProfileRules = [
  body('licenseNumber').optional().trim().notEmpty(),
  body('licenseExpiry').optional().isISO8601(),
  body('isAvailable').optional().isBoolean(),
  body('bankDetails.accountHolderName').optional().trim(),
  body('bankDetails.accountNumber').optional().trim(),
  body('bankDetails.ifscCode').optional().trim(),
  body('bankDetails.bankName').optional().trim(),
];

export const documentUploadRules = [
  body('type')
    .isIn(['license', 'id_proof', 'address_proof', 'vehicle_rc'])
    .withMessage('Invalid document type'),
];