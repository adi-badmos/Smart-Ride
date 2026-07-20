import { Attendance } from '../models/attendance.model.js';
import { Subscription } from '../models/subscription.model.js';
import { getDriverProfileByUserId } from './driver.service.js';
import { getRouteForDriverProfile } from './route.service.js';
import { AppError } from '../utils/AppError.js';
import { SUBSCRIPTION_STATUS } from '../utils/constants.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const markAttendance = async (
  driverUserId,
  { subscriptionId, date, status, pickupTime, dropTime, notes }
) => {
  const driverProfile = await getDriverProfileByUserId(driverUserId);
  if (!driverProfile) throw new AppError('Driver profile not found', 404);

  const route = await getRouteForDriverProfile(driverProfile._id);
  if (!route) {
    throw new AppError('You are not currently assigned to a route', 400, 'NO_ROUTE_ASSIGNED');
  }

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    route: route._id,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  });
  if (!subscription) {
    throw new AppError('This rider is not on your route', 400, 'INVALID_SUBSCRIPTION_FOR_ROUTE');
  }

  try {
    const attendance = await Attendance.create({
      subscription: subscription._id,
      user: subscription.user,
      route: route._id,
      driver: driverProfile._id,
      date: normalizeDate(date),
      status,
      markedBy: driverUserId,
      pickupTime,
      dropTime,
      notes,
    });
    return attendance;
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(
        'Attendance for this rider on this date has already been marked',
        409,
        'DUPLICATE_ATTENDANCE'
      );
    }
    throw err;
  }
};

export const getAttendanceForRouteAndDate = async (driverUserId, routeId, date) => {
  const driverProfile = await getDriverProfileByUserId(driverUserId);
  if (!driverProfile) throw new AppError('Driver profile not found', 404);

  const route = await getRouteForDriverProfile(driverProfile._id);
  if (!route || route._id.toString() !== routeId) {
    throw new AppError('You are not assigned to this route', 403);
  }

  return Attendance.find({ route: routeId, date: normalizeDate(date) })
    .populate('user', 'name phone')
    .sort({ createdAt: 1 });
};

export const getMyAttendance = async (userId) => {
  return Attendance.find({ user: userId }).populate('route', 'name city').sort({ date: -1 });
};

export const listAttendanceHistory = async (reqQuery = {}) => {
  const { status, routeId } = reqQuery;
  const filter = {};
  if (status) filter.status = status;
  if (routeId) filter.route = routeId;

  const { page, limit, skip } = getPagination(reqQuery);
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('user', 'name email')
      .populate('route', 'name city')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);
  return { records, pagination: buildPaginationMeta(page, limit, total) };
};