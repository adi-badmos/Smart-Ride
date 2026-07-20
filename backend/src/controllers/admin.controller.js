import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { listUsers, getUserById, updateUserStatus } from '../services/admin.service.js';
import { createDriverAccount, listDrivers, getDriverById, verifyDriver } from '../services/driver.service.js';
import {
  listAllSubscriptions,
  listPendingSubscriptions,
  assignRouteToSubscription,
} from '../services/subscription.service.js';
import { listAllComplaints, updateComplaint } from '../services/complaint.service.js';
import { createPayout, listAllPayouts, updatePayoutStatus } from '../services/payout.service.js';

export const getUsers = catchAsync(async (req, res) => {
  const { users, pagination } = await listUsers(req.query);
  return sendSuccess(res, 200, { users, pagination });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, 200, { user });
});

export const setUserStatus = catchAsync(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.isActive);
  return sendSuccess(res, 200, { user });
});

export const createDriver = catchAsync(async (req, res) => {
  const { name, email, password, phone, licenseNumber, licenseExpiry, bankDetails } = req.body;
  const result = await createDriverAccount({
    name,
    email,
    password,
    phone,
    licenseNumber,
    licenseExpiry,
    bankDetails,
  });
  return sendSuccess(res, 201, result);
});

export const getDrivers = catchAsync(async (req, res) => {
  const { drivers, pagination } = await listDrivers(req.query);
  return sendSuccess(res, 200, { drivers, pagination });
});

export const getDriverDetail = catchAsync(async (req, res) => {
  const driver = await getDriverById(req.params.id);
  return sendSuccess(res, 200, { driver });
});

export const verifyDriverHandler = catchAsync(async (req, res) => {
  const driverProfile = await verifyDriver(req.params.id, req.body.status);
  return sendSuccess(res, 200, { driverProfile });
});

export const getSubscriptions = catchAsync(async (req, res) => {
  const { subscriptions, pagination } = await listAllSubscriptions(req.query);
  return sendSuccess(res, 200, { subscriptions, pagination });
});

export const getPendingSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await listPendingSubscriptions();
  return sendSuccess(res, 200, { subscriptions });
});

export const assignRouteHandler = catchAsync(async (req, res) => {
  const { routeId, pickupPointId } = req.body;
  const result = await assignRouteToSubscription(req.params.id, { routeId, pickupPointId });
  return sendSuccess(res, 200, result);
});

export const getComplaints = catchAsync(async (req, res) => {
  const { complaints, pagination } = await listAllComplaints(req.query);
  return sendSuccess(res, 200, { complaints, pagination });
});

export const updateComplaintHandler = catchAsync(async (req, res) => {
  const { status, adminResponse, priority } = req.body;
  const complaint = await updateComplaint(req.params.id, { status, adminResponse, priority });
  return sendSuccess(res, 200, { complaint });
});

export const getPayouts = catchAsync(async (req, res) => {
  const { payouts, pagination } = await listAllPayouts(req.query);
  return sendSuccess(res, 200, { payouts, pagination });
});

export const createPayoutHandler = catchAsync(async (req, res) => {
  const { driverProfileId, amount, period } = req.body;
  const payout = await createPayout({ driverProfileId, amount, period });
  return sendSuccess(res, 201, { payout });
});

export const updatePayoutHandler = catchAsync(async (req, res) => {
  const { status, transactionRef } = req.body;
  const payout = await updatePayoutStatus(req.params.id, { status, transactionRef });
  return sendSuccess(res, 200, { payout });
});