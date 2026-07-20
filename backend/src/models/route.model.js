import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema(
  { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
  { _id: false }
);

// Embedded on purpose (see Architecture Decisions: embed vs reference) —
// pickup points are only ever viewed through their parent Route, never
// queried independently. Each still gets its own Mongoose _id because
// Subscription.assignedPickupPoint references it directly, never by
// array index (an index breaks the moment the array is reordered/edited).
const pickupPointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    coordinates: { type: coordinatesSchema, default: () => ({}) }, // Tier 1: null; Tier 2 (Phase 14) populates
    order: { type: Number, required: true },
  },
  { _id: true }
);

const destinationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    coordinates: { type: coordinatesSchema, default: () => ({}) },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    departureTime: { type: String, required: true }, // e.g. "08:00"
    arrivalTime: { type: String, required: true },
    operatingDays: {
      type: [String],
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    pickupPoints: { type: [pickupPointSchema], default: [] },
    destination: { type: destinationSchema, required: true },
    schedule: { type: scheduleSchema, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', default: null },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    capacity: { type: Number, required: true, min: 1 },
    // No currentOccupancy field — occupancy is always computed fresh from
    // Subscription counts (see Architecture Decisions: Capacity). No fare
    // field either — pricing lives on SubscriptionPlan.
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const Route = mongoose.model('Route', routeSchema);