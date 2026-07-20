import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardStats, getRevenueStats, getRegistrationTrend } from '../services/dashboard.service.js';

export const getStatsHandler = catchAsync(async (req, res) => {
  const stats = await getDashboardStats();
  return sendSuccess(res, 200, stats);
});

export const getRevenueHandler = catchAsync(async (req, res) => {
  const revenue = await getRevenueStats();
  return sendSuccess(res, 200, revenue);
});

export const getTrendsHandler = catchAsync(async (req, res) => {
  const trends = await getRegistrationTrend();
  return sendSuccess(res, 200, trends);
});