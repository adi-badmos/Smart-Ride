import { body } from 'express-validator';

export const createSubscriptionRules = [
  body('planId').isMongoId().withMessage('A valid plan is required'),
  body('homeAddress.address').trim().notEmpty().withMessage('Home address is required'),
  body('desiredDestination.address').trim().notEmpty().withMessage('Destination address is required'),
];

export const assignRouteRules = [
  body('routeId').isMongoId().withMessage('A valid route is required'),
  body('pickupPointId').isMongoId().withMessage('A valid pickup point is required'),
];