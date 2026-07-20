import { body } from 'express-validator';

export const mockPayRules = [body('subscriptionId').isMongoId().withMessage('A valid subscription is required')];

export const createOrderRules = [
  body('subscriptionId').isMongoId().withMessage('A valid subscription is required'),
];

export const verifyPaymentRules = [
  body('razorpay_order_id').trim().notEmpty().withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id').trim().notEmpty().withMessage('razorpay_payment_id is required'),
  body('razorpay_signature').trim().notEmpty().withMessage('razorpay_signature is required'),
];