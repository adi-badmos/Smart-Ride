import { body } from 'express-validator';

export const updateUserStatusRules = [
  body('isActive').isBoolean().withMessage('isActive must be true or false'),
];

export const verifyDriverRules = [
  body('status')
    .isIn(['pending', 'in_review', 'approved', 'rejected'])
    .withMessage('Invalid verification status'),
];