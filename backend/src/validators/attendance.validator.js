import { body, param } from 'express-validator';

export const markAttendanceRules = [
  body('subscriptionId').isMongoId().withMessage('A valid subscription is required'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('status').isIn(['present', 'absent', 'leave']).withMessage('Invalid status'),
  body('pickupTime').optional().trim(),
  body('dropTime').optional().trim(),
  body('notes').optional().trim(),
];

export const routeDateParamRules = [
  param('routeId').isMongoId().withMessage('Invalid route id'),
  param('date').isISO8601().withMessage('Invalid date'),
];