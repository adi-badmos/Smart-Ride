import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { mockPayRules, createOrderRules, verifyPaymentRules } from '../validators/payment.validator.js';
import {
  mockPayHandler,
  createOrderHandler,
  verifyPaymentHandler,
  getMyPayments,
  getMyPaymentDetail,
} from '../controllers/payment.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.USER));

router.post('/mock-pay', mockPayRules, validate, mockPayHandler); // kept for dev/testing convenience

router.post('/create-order', createOrderRules, validate, createOrderHandler);
router.post('/verify', verifyPaymentRules, validate, verifyPaymentHandler);
router.get('/my-payments', getMyPayments);
router.get('/:id', getMyPaymentDetail);

export default router;