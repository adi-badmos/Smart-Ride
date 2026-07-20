import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { DriverProfile } from '../models/driverProfile.model.js';
import { AppError } from '../utils/AppError.js';
import { ROLES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { issueTokenPair } from './auth.service.js';
import { send } from './notificationService.js';

export const createDriverAccount = async ({
  name,
  email,
  password,
  phone,
  licenseNumber,
  licenseExpiry,
  bankDetails,
}) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const user = await User.create({ name, email, password, phone, role: ROLES.DRIVER });

  try {
    const profile = await DriverProfile.create({
      user: user._id,
      licenseNumber,
      licenseExpiry,
      bankDetails,
      verificationStatus: 'approved',
    });
    return { user: user.toSafeObject(), driverProfile: profile };
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
};

// Now reuses the shared issueTokenPair from auth.service.js — same
// pair-issuing + storage logic riders get, instead of a hand-rolled
// single-access-token version.
export const registerDriverSelf = async ({ name, email, password, phone, licenseNumber, licenseExpiry }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const user = await User.create({ name, email, password, phone, role: ROLES.DRIVER });

  let profile;
  try {
    profile = await DriverProfile.create({
      user: user._id,
      licenseNumber,
      licenseExpiry,
      verificationStatus: 'pending',
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), driverProfile: profile, ...tokens };
};

export const listDrivers = async (reqQuery = {}) => {
  const { search, verificationStatus } = reqQuery;
  const filter = {};
  if (verificationStatus) filter.verificationStatus = verificationStatus;

  if (search) {
    const matchingUserIds = await User.find({
      role: ROLES.DRIVER,
      $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
    }).distinct('_id');
    filter.user = { $in: matchingUserIds };
  }

  const { page, limit, skip } = getPagination(reqQuery);
  const [drivers, total] = await Promise.all([
    DriverProfile.find(filter)
      .populate('user', '-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DriverProfile.countDocuments(filter),
  ]);
  return { drivers, pagination: buildPaginationMeta(page, limit, total) };
};

export const getDriverById = async (driverProfileId) => {
  if (!mongoose.Types.ObjectId.isValid(driverProfileId)) {
    throw new AppError('Driver not found', 404);
  }
  const profile = await DriverProfile.findById(driverProfileId).populate(
    'user',
    '-password -refreshToken'
  );
  if (!profile) throw new AppError('Driver not found', 404);
  return profile;
};

export const getDriverProfileByUserId = async (userId) => {
  return DriverProfile.findOne({ user: userId });
};

export const getMyDriverProfile = async (userId) => {
  const profile = await DriverProfile.findOne({ user: userId });
  if (!profile) throw new AppError('Driver profile not found', 404);
  return profile;
};

export const updateDriverProfile = async (userId, { licenseNumber, licenseExpiry, bankDetails, isAvailable }) => {
  const updates = {};
  if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
  if (licenseExpiry !== undefined) updates.licenseExpiry = licenseExpiry;
  if (bankDetails !== undefined) updates.bankDetails = bankDetails;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;

  const profile = await DriverProfile.findOneAndUpdate({ user: userId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new AppError('Driver profile not found', 404);
  return profile;
};

export const addDriverDocument = async (userId, { type, url, publicId }) => {
  const profile = await DriverProfile.findOneAndUpdate(
    { user: userId },
    { $push: { documents: { type, url, publicId, status: 'pending' } } },
    { new: true, runValidators: true }
  );
  if (!profile) throw new AppError('Driver profile not found', 404);
  return profile;
};

export const verifyDriver = async (driverProfileId, status) => {
  const profile = await DriverProfile.findById(driverProfileId).populate('user', 'name email');
  if (!profile) throw new AppError('Driver not found', 404);

  profile.verificationStatus = status;
  await profile.save();

  if (status === 'approved') {
    await send(NOTIFICATION_TYPES.DRIVER_APPROVED, {
      userEmail: profile.user.email,
      userName: profile.user.name,
    });
  }

  return profile;
};

// Added at the bottom of the file, but hoisted here mentally: pagination
// helpers are imported below to keep the diff against Phase 10 minimal
// at the top of the file.
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';