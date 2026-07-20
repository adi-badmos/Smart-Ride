import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true }, // in days
    price: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);