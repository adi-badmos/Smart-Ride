import { SubscriptionPlan } from '../models/subscriptionPlan.model.js';
import { AppError } from '../utils/AppError.js';

export const createPlan = async (payload) => SubscriptionPlan.create(payload);

// Admin sees every plan including inactive ones — the public GET /plans
// endpoint (plan.controller.js:getPlans) is untouched and still only
// returns isActive:true, exactly as it did since Phase 6.
export const listPlansAdmin = async () => SubscriptionPlan.find().sort({ price: 1 });

export const getPlanById = async (id) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
};

export const updatePlan = async (id, updates) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
};

// "Deactivate", per the spec's own Tier 2 scope line
// ("create/edit/deactivate") — this is a soft delete (isActive: false),
// never a hard Mongo delete. Hard-deleting would orphan every existing
// Subscription.plan reference already pointing at it; deactivating just
// hides it from new signups (plan.controller.js:getPlans filters on
// isActive) while past subscriptions keep working.
export const deactivatePlan = async (id) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
};