import { Vehicle } from '../models/vehicle.model.js';
import { DriverProfile } from '../models/driverProfile.model.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

const assertDriverExists = async (driverProfileId) => {
  if (!driverProfileId) return;
  const exists = await DriverProfile.exists({ _id: driverProfileId });
  if (!exists) throw new AppError('Referenced driver does not exist', 400, 'INVALID_DRIVER_REF');
};

export const createVehicle = async (payload) => {
  await assertDriverExists(payload.driverProfile);
  const existing = await Vehicle.findOne({ registrationNumber: payload.registrationNumber });
  if (existing) {
    throw new AppError('A vehicle with this registration number already exists.', 409, 'DUPLICATE_VEHICLE');
  }
  return Vehicle.create(payload);
};

export const listVehicles = async (reqQuery = {}) => {
  const { search, type, isActive } = reqQuery;
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.registrationNumber = { $regex: search, $options: 'i' };

  const { page, limit, skip } = getPagination(reqQuery);
  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .populate({ path: 'driverProfile', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vehicle.countDocuments(filter),
  ]);
  return { vehicles, pagination: buildPaginationMeta(page, limit, total) };
};

export const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id).populate({
    path: 'driverProfile',
    populate: { path: 'user', select: 'name email' },
  });
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};

export const updateVehicle = async (id, updates) => {
  if (updates.driverProfile !== undefined) {
    await assertDriverExists(updates.driverProfile);
  }
  const vehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};

export const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};