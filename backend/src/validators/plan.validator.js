import { body } from 'express-validator';

export const createPlanRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer (days)'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  body('features.*').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export const updatePlanRules = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('features').optional().isArray(),
  body('features.*').optional().isString(),
  body('isActive').optional().isBoolean(),
];