import { Route } from '../models/route.model.js';
import { DriverProfile } from '../models/driverProfile.model.js';
import { Vehicle } from '../models/vehicle.model.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

const assertReferencesExist = async ({ driver, vehicle }) => {
  if (driver) {
    const exists = await DriverProfile.exists({ _id: driver });
    if (!exists) throw new AppError('Referenced driver does not exist', 400, 'INVALID_DRIVER_REF');
  }
  if (vehicle) {
    const exists = await Vehicle.exists({ _id: vehicle });
    if (!exists) throw new AppError('Referenced vehicle does not exist', 400, 'INVALID_VEHICLE_REF');
  }
};

export const createRoute = async (payload) => {
  await assertReferencesExist(payload);
  return Route.create(payload);
};

export const listRoutes = async (reqQuery = {}) => {
  const { search, city, status } = reqQuery;
  const filter = {};
  if (city) filter.city = city;
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const { page, limit, skip } = getPagination(reqQuery);
  const [routes, total] = await Promise.all([
    Route.find(filter)
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } })
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Route.countDocuments(filter),
  ]);
  return { routes, pagination: buildPaginationMeta(page, limit, total) };
};

export const getRouteById = async (id) => {
  const route = await Route.findById(id)
    .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } })
    .populate('vehicle');
  if (!route) throw new AppError('Route not found', 404);
  return route;
};

export const updateRoute = async (id, updates) => {
  await assertReferencesExist(updates);
  const route = await Route.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!route) throw new AppError('Route not found', 404);
  return route;
};

export const deleteRoute = async (id) => {
  const route = await Route.findByIdAndDelete(id);
  if (!route) throw new AppError('Route not found', 404);
  return route;
};

export const getRouteForDriverProfile = async (driverProfileId) => {
  return Route.findOne({ driver: driverProfileId, status: 'active' })
    .populate('vehicle')
    .lean();
};