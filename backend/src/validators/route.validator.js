import { body } from 'express-validator';

const pickupPointRules = (prefix = 'pickupPoints') => [
  body(prefix).isArray({ min: 1 }).withMessage('At least one pickup point is required'),
  body(`${prefix}.*.name`).trim().notEmpty().withMessage('Pickup point name is required'),
  body(`${prefix}.*.address`).trim().notEmpty().withMessage('Pickup point address is required'),
  body(`${prefix}.*.order`).isInt({ min: 0 }).withMessage('Pickup point order must be a non-negative integer'),
];

export const createRouteRules = [
  body('name').trim().notEmpty().withMessage('Route name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  ...pickupPointRules(),
  body('destination.address').trim().notEmpty().withMessage('Destination address is required'),
  body('schedule.departureTime').trim().notEmpty().withMessage('Departure time is required'),
  body('schedule.arrivalTime').trim().notEmpty().withMessage('Arrival time is required'),
  body('schedule.operatingDays')
    .isArray({ min: 1 })
    .withMessage('At least one operating day is required'),
  body('schedule.operatingDays.*')
    .isIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    .withMessage('Invalid operating day'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('driver').optional({ nullable: true }).isMongoId().withMessage('Invalid driver reference'),
  body('vehicle').optional({ nullable: true }).isMongoId().withMessage('Invalid vehicle reference'),
];

export const updateRouteRules = [
  body('name').optional().trim().notEmpty(),
  body('city').optional().trim().notEmpty(),
  body('pickupPoints').optional().isArray({ min: 1 }),
  body('pickupPoints.*.name').optional().trim().notEmpty(),
  body('pickupPoints.*.address').optional().trim().notEmpty(),
  body('pickupPoints.*.order').optional().isInt({ min: 0 }),
  body('destination.address').optional().trim().notEmpty(),
  body('schedule.departureTime').optional().trim().notEmpty(),
  body('schedule.arrivalTime').optional().trim().notEmpty(),
  body('schedule.operatingDays').optional().isArray({ min: 1 }),
  body('schedule.operatingDays.*').optional().isIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  body('capacity').optional().isInt({ min: 1 }),
  body('driver').optional({ nullable: true }).isMongoId(),
  body('vehicle').optional({ nullable: true }).isMongoId(),
  body('status').optional().isIn(['active', 'inactive']),
];