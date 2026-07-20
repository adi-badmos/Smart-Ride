import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { uploadBuffer } from '../utils/cloudinary.js';
import { setAuthCookies } from '../utils/cookies.js';
import {
  getDriverProfileByUserId,
  registerDriverSelf,
  getMyDriverProfile,
  updateDriverProfile,
  addDriverDocument,
} from '../services/driver.service.js';
import { getRouteForDriverProfile } from '../services/route.service.js';
import { Subscription } from '../models/subscription.model.js';
import { SUBSCRIPTION_STATUS } from '../utils/constants.js';

export const getMyRoute = catchAsync(async (req, res) => {
  const driverProfile = await getDriverProfileByUserId(req.user._id);
  if (!driverProfile) {
    return sendSuccess(res, 200, { route: null });
  }
  const route = await getRouteForDriverProfile(driverProfile._id);
  return sendSuccess(res, 200, { route });
});

export const getMyCommuters = catchAsync(async (req, res) => {
  const driverProfile = await getDriverProfileByUserId(req.user._id);
  if (!driverProfile) return sendSuccess(res, 200, { commuters: [] });

  const route = await getRouteForDriverProfile(driverProfile._id);
  if (!route) return sendSuccess(res, 200, { commuters: [] });

  const subscriptions = await Subscription.find({
    route: route._id,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  })
    .populate('user', 'name phone')
    .lean();

  const commuters = subscriptions.map((sub) => {
    const pickupPoint = route.pickupPoints.find(
      (p) => p._id.toString() === sub.assignedPickupPoint?.toString()
    );
    return {
      _id: sub._id,
      name: sub.user?.name,
      phone: sub.user?.phone,
      pickupPoint: pickupPoint?.name || 'Unknown',
    };
  });

  return sendSuccess(res, 200, { commuters });
});

export const registerDriverHandler = catchAsync(async (req, res) => {
  const { name, email, password, phone, licenseNumber, licenseExpiry } = req.body;
  const { user, driverProfile, accessToken, refreshToken } = await registerDriverSelf({
    name,
    email,
    password,
    phone,
    licenseNumber,
    licenseExpiry,
  });

  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, 201, { user, driverProfile });
});

export const getMyDriverProfileHandler = catchAsync(async (req, res) => {
  const driverProfile = await getMyDriverProfile(req.user._id);
  return sendSuccess(res, 200, { driverProfile });
});

export const updateMyDriverProfileHandler = catchAsync(async (req, res) => {
  const driverProfile = await updateDriverProfile(req.user._id, req.body);
  return sendSuccess(res, 200, { driverProfile });
});

export const uploadDocumentHandler = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }

  const uploadResult = await uploadBuffer(req.file.buffer, 'smart-ride/driver-documents');

  const driverProfile = await addDriverDocument(req.user._id, {
    type: req.body.type,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });

  return sendSuccess(res, 201, { driverProfile });
});