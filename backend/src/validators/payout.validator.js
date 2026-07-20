import { body } from 'express-validator';

export const createPayoutRules = [
  body('driverProfileId').isMongoId().withMessage('A valid driver is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('period.startDate').isISO8601().withMessage('A valid period start date is required'),
  body('period.endDate').isISO8601().withMessage('A valid period end date is required'),
];

export const updatePayoutRules = [
  body('status').isIn(['pending', 'processed', 'paid', 'failed']).withMessage('Invalid status'),
  body('transactionRef').optional().trim(),
];