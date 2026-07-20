import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../services/vehicle.service.js';

export const createVehicleHandler = catchAsync(async (req, res) => {
  const vehicle = await createVehicle(req.body);
  return sendSuccess(res, 201, { vehicle });
});

export const getVehicles = catchAsync(async (req, res) => {
  const { vehicles, pagination } = await listVehicles(req.query);
  return sendSuccess(res, 200, { vehicles, pagination });
});

export const getVehicle = catchAsync(async (req, res) => {
  const vehicle = await getVehicleById(req.params.id);
  return sendSuccess(res, 200, { vehicle });
});

export const updateVehicleHandler = catchAsync(async (req, res) => {
  const vehicle = await updateVehicle(req.params.id, req.body);
  return sendSuccess(res, 200, { vehicle });
});

export const deleteVehicleHandler = catchAsync(async (req, res) => {
  await deleteVehicle(req.params.id);
  return sendSuccess(res, 200, { message: 'Vehicle deleted' });
});