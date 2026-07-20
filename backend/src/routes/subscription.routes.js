import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSubscriptionRules } from '../validators/subscription.validator.js';
import {
  createSubscriptionHandler,
  getMySubscriptions,
  getMySubscriptionDetail,
  cancelMySubscriptionHandler,
} from '../controllers/subscription.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.USER));

router.post('/', createSubscriptionRules, validate, createSubscriptionHandler);
router.get('/my-subscriptions', getMySubscriptions);
router.get('/:id', getMySubscriptionDetail);
router.put('/:id/cancel', cancelMySubscriptionHandler);

export default router;