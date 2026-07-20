import { body } from 'express-validator';

export const createVehicleRules = [
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('type').isIn(['sedan', 'suv', 'van', 'bus']).withMessage('Invalid vehicle type'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1980 }).withMessage('Valid year is required'),
  body('insuranceExpiry').isISO8601().withMessage('Insurance expiry must be a valid date'),
  body('driverProfile').optional({ nullable: true }).isMongoId().withMessage('Invalid driver reference'),
];

export const updateVehicleRules = [
  body('registrationNumber').optional().trim().notEmpty(),
  body('type').optional().isIn(['sedan', 'suv', 'van', 'bus']),
  body('capacity').optional().isInt({ min: 1 }),
  body('make').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1980 }),
  body('insuranceExpiry').optional().isISO8601(),
  body('driverProfile').optional({ nullable: true }).isMongoId(),
  body('isActive').optional().isBoolean(),
];