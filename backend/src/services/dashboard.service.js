import { User } from '../models/user.model.js';
import { DriverProfile } from '../models/driverProfile.model.js';
import { Subscription } from '../models/subscription.model.js';
import { Payment } from '../models/payment.model.js';
import { Route } from '../models/route.model.js';
import { Complaint } from '../models/complaint.model.js';
import { Attendance } from '../models/attendance.model.js';
import { ROLES, SUBSCRIPTION_STATUS } from '../utils/constants.js';
import { getRouteOccupancy } from './capacity.service.js';

export const getDashboardStats = async () => {
  const [totalUsers, totalDrivers, activeSubscriptions, subscriptionDistributionRaw, complaintStatsRaw] =
    await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      DriverProfile.countDocuments(),
      Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
      Subscription.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

  const subscriptionDistribution = subscriptionDistributionRaw.map((s) => ({ status: s._id, count: s.count }));
  const pendingAssignments =
    subscriptionDistribution.find((s) => s.status === SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT)?.count || 0;

  const complaintStats = complaintStatsRaw.map((c) => ({ status: c._id, count: c.count }));

  // Route utilization — reuses the exact same getRouteOccupancy() that
  // Phase 6's admin assignment screen calls. Both agree by construction,
  // per Architecture Decisions: Capacity — there is only ever one place
  // occupancy is computed.
  const activeRoutes = await Route.find({ status: 'active' }).select('name city capacity').lean();
  const routeUtilization = await Promise.all(
    activeRoutes.map(async (route) => {
      const currentOccupancy = await getRouteOccupancy(route._id);
      return {
        routeId: route._id,
        name: route.name,
        city: route.city,
        capacity: route.capacity,
        currentOccupancy,
        utilizationPercent: route.capacity > 0 ? Math.round((currentOccupancy / route.capacity) * 100) : 0,
      };
    })
  );

  // Attendance rate — present / total marked, across all recorded
  // attendance. Null (not 0) when nothing has been marked yet, so the
  // frontend can distinguish "no data" from "0% attendance".
  const attendanceAgg = await Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const totalAttendanceMarks = attendanceAgg.reduce((sum, a) => sum + a.count, 0);
  const presentMarks = attendanceAgg.find((a) => a._id === 'present')?.count || 0;
  const attendanceRatePercent =
    totalAttendanceMarks > 0 ? Math.round((presentMarks / totalAttendanceMarks) * 100) : null;

  return {
    totalUsers,
    totalDrivers,
    activeSubscriptions,
    pendingAssignments,
    subscriptionDistribution,
    complaintStats,
    routeUtilization,
    attendanceRatePercent,
  };
};

export const getRevenueStats = async () => {
  const [totalAgg, monthlyAgg] = await Promise.all([
    // Only 'captured' payments count as real revenue — 'created'/
    // 'authorized' are in-flight, 'failed'/'refunded' are not revenue.
    // This correctly includes both method: 'mock' (Tier 1) and
    // method: 'razorpay' (Tier 2) captures, per the Payment model design.
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: 'captured' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = totalAgg[0]?.total || 0;
  const monthlyRevenue = monthlyAgg.map((m) => ({
    year: m._id.year,
    month: m._id.month,
    total: m.total,
    paymentCount: m.count,
  }));

  return { totalRevenue, monthlyRevenue };
};

export const getRegistrationTrend = async () => {
  const trendRaw = await User.aggregate([
    { $match: { role: ROLES.USER } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const registrationTrend = trendRaw.map((r) => ({
    date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
    count: r.count,
  }));

  return { registrationTrend };
};