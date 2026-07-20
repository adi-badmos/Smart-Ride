import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createSubscription,
  listMySubscriptions,
  getMySubscriptionById,
  cancelMySubscription,
} from '../services/subscription.service.js';

export const createSubscriptionHandler = catchAsync(async (req, res) => {
  const { planId, homeAddress, desiredDestination } = req.body;
  const subscription = await createSubscription(req.user._id, { planId, homeAddress, desiredDestination });
  return sendSuccess(res, 201, { subscription });
});

export const getMySubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await listMySubscriptions(req.user._id);
  return sendSuccess(res, 200, { subscriptions });
});

export const getMySubscriptionDetail = catchAsync(async (req, res) => {
  const subscription = await getMySubscriptionById(req.user._id, req.params.id);
  return sendSuccess(res, 200, { subscription });
});

export const cancelMySubscriptionHandler = catchAsync(async (req, res) => {
  const subscription = await cancelMySubscription(req.user._id, req.params.id);
  return sendSuccess(res, 200, { subscription });
});