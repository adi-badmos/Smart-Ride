import { Subscription } from '../models/subscription.model.js';
import { SubscriptionPlan } from '../models/subscriptionPlan.model.js';
import { Route } from '../models/route.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { SUBSCRIPTION_STATUS, NOTIFICATION_TYPES } from '../utils/constants.js';
import { getRouteOccupancy } from './capacity.service.js';
import { send } from './notificationService.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const createSubscription = async (userId, { planId, homeAddress, desiredDestination }) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new AppError('Selected plan is not available', 400, 'INVALID_PLAN');
  }

  return Subscription.create({
    user: userId,
    plan: planId,
    homeAddress,
    desiredDestination,
    status: SUBSCRIPTION_STATUS.PAYMENT_PENDING,
  });
};

export const listMySubscriptions = async (userId) => {
  return Subscription.find({ user: userId })
    .populate('plan')
    .populate('route', 'name city schedule')
    .sort({ createdAt: -1 });
};

export const getMySubscriptionById = async (userId, id) => {
  const subscription = await Subscription.findOne({ _id: id, user: userId })
    .populate('plan')
    .populate('route');
  if (!subscription) throw new AppError('Subscription not found', 404);
  return subscription;
};

export const cancelMySubscription = async (userId, id) => {
  const subscription = await Subscription.findOne({ _id: id, user: userId });
  if (!subscription) throw new AppError('Subscription not found', 404);

  const cancellableFrom = [SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT, SUBSCRIPTION_STATUS.ACTIVE];
  if (!cancellableFrom.includes(subscription.status)) {
    throw new AppError(
      `Cannot cancel a subscription with status ${subscription.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
  await subscription.save();
  return subscription;
};

// --- Admin ---

export const listAllSubscriptions = async (reqQuery = {}) => {
  const { status, search } = reqQuery;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const matchingUserIds = await User.find({
      $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
    }).distinct('_id');
    filter.user = { $in: matchingUserIds };
  }

  const { page, limit, skip } = getPagination(reqQuery);
  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration')
      .populate('route', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Subscription.countDocuments(filter),
  ]);
  return { subscriptions, pagination: buildPaginationMeta(page, limit, total) };
};

// Deliberately left unpaginated — this is a small, actionable working
// queue (admin clears it, not browses it), not a historical list.
export const listPendingSubscriptions = async () => {
  return Subscription.find({ status: SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT })
    .populate('user', 'name email phone')
    .populate('plan', 'name price duration')
    .sort({ createdAt: 1 });
};

export const assignRouteToSubscription = async (subscriptionId, { routeId, pickupPointId }) => {
  const subscription = await Subscription.findById(subscriptionId)
    .populate('plan')
    .populate('user', 'name email');
  if (!subscription) throw new AppError('Subscription not found', 404);

  if (subscription.status !== SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT) {
    throw new AppError(
      `Cannot assign a route to a subscription with status ${subscription.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const route = await Route.findById(routeId);
  if (!route) throw new AppError('Route not found', 404);

  const pickupPoint = route.pickupPoints.id(pickupPointId);
  if (!pickupPoint) {
    throw new AppError('Pickup point does not belong to the selected route', 400, 'INVALID_PICKUP_POINT');
  }

  const currentOccupancy = await getRouteOccupancy(routeId);
  const isOverCapacity = currentOccupancy >= route.capacity;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + subscription.plan.duration * MS_PER_DAY);

  subscription.route = routeId;
  subscription.assignedPickupPoint = pickupPointId;
  subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  await subscription.save();

  await send(NOTIFICATION_TYPES.DRIVER_ASSIGNED, {
    userEmail: subscription.user.email,
    userName: subscription.user.name,
    routeName: route.name,
    pickupPointName: pickupPoint.name,
    departureTime: route.schedule.departureTime,
  });

  return {
    subscription,
    occupancyWarning: isOverCapacity ? { currentOccupancy, capacity: route.capacity } : null,
  };
};