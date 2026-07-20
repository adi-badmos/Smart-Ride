import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../utils/constants.js';

// Same shape as Route's location fields (Architecture Decisions: Location
// fields) — coordinates typed in from day one, only `address` populated
// in Tier 1, Tier 2's Maps integration fills coordinates with zero
// migration.
const addressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    // Captured here, not on User — see Architecture Decisions: Addresses
    // live on Subscription, not on User. Keeps history stable even if
    // the rider moves and re-subscribes later from a new address.
    homeAddress: { type: addressSchema, required: true },
    desiredDestination: { type: addressSchema, required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    // References Route.pickupPoints[]._id directly — never an array
    // index (see Architecture Decisions: reference subdocuments by _id).
    assignedPickupPoint: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.PAYMENT_PENDING,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null }, // Payment model lands in Phase 7
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ route: 1, status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);