import { Subscription } from '../models/subscription.model.js';
import { SUBSCRIPTION_STATUS } from '../utils/constants.js';

// The ONE place occupancy is computed. Never store a currentOccupancy
// counter on Route — see Architecture Decisions: Capacity. Both the
// Tier 1 admin assignment screen and the Tier 2 KPI dashboard (Phase 13)
// call this same function so they agree by construction. A seat only
// counts once `route` is actually set — WAITING_ASSIGNMENT never occupies
// a seat.
export const getRouteOccupancy = async (routeId) => {
  return Subscription.countDocuments({ route: routeId, status: SUBSCRIPTION_STATUS.ACTIVE });
};