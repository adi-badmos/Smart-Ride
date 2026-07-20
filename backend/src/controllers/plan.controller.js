import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { SubscriptionPlan } from '../models/subscriptionPlan.model.js';
import { createPlan, listPlansAdmin, getPlanById, updatePlan, deactivatePlan } from '../services/plan.service.js';

// Public — unchanged since Phase 6.
export const getPlans = catchAsync(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
  return sendSuccess(res, 200, { plans });
});

// --- Admin CRUD (Phase 15) ---

export const createPlanHandler = catchAsync(async (req, res) => {
  const plan = await createPlan(req.body);
  return sendSuccess(res, 201, { plan });
});

export const getPlansAdminHandler = catchAsync(async (req, res) => {
  const plans = await listPlansAdmin();
  return sendSuccess(res, 200, { plans });
});

export const getPlanHandler = catchAsync(async (req, res) => {
  const plan = await getPlanById(req.params.id);
  return sendSuccess(res, 200, { plan });
});

export const updatePlanHandler = catchAsync(async (req, res) => {
  const plan = await updatePlan(req.params.id, req.body);
  return sendSuccess(res, 200, { plan });
});

export const deactivatePlanHandler = catchAsync(async (req, res) => {
  const plan = await deactivatePlan(req.params.id);
  return sendSuccess(res, 200, { plan });
});