import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  markAttendance,
  getAttendanceForRouteAndDate,
  getMyAttendance,
  listAttendanceHistory,
} from '../services/attendance.service.js';

export const markAttendanceHandler = catchAsync(async (req, res) => {
  const { subscriptionId, date, status, pickupTime, dropTime, notes } = req.body;
  const attendance = await markAttendance(req.user._id, {
    subscriptionId,
    date,
    status,
    pickupTime,
    dropTime,
    notes,
  });
  return sendSuccess(res, 201, { attendance });
});

export const getRouteAttendanceHandler = catchAsync(async (req, res) => {
  const { routeId, date } = req.params;
  const records = await getAttendanceForRouteAndDate(req.user._id, routeId, date);
  return sendSuccess(res, 200, { records });
});

export const getMyAttendanceHandler = catchAsync(async (req, res) => {
  const records = await getMyAttendance(req.user._id);
  return sendSuccess(res, 200, { records });
});

export const getAttendanceHistoryHandler = catchAsync(async (req, res) => {
  const { records, pagination } = await listAttendanceHistory(req.query);
  return sendSuccess(res, 200, { records, pagination });
});