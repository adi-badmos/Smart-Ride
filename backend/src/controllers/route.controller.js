import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createRoute,
  listRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../services/route.service.js';
import { getRouteOccupancy } from '../services/capacity.service.js';

export const createRouteHandler = catchAsync(async (req, res) => {
  const route = await createRoute(req.body);
  return sendSuccess(res, 201, { route });
});

export const getRoutes = catchAsync(async (req, res) => {
  const { routes, pagination } = await listRoutes(req.query);
  return sendSuccess(res, 200, { routes, pagination });
});

export const getRoute = catchAsync(async (req, res) => {
  const route = await getRouteById(req.params.id);
  return sendSuccess(res, 200, { route });
});

export const updateRouteHandler = catchAsync(async (req, res) => {
  const route = await updateRoute(req.params.id, req.body);
  return sendSuccess(res, 200, { route });
});

export const deleteRouteHandler = catchAsync(async (req, res) => {
  await deleteRoute(req.params.id);
  return sendSuccess(res, 200, { message: 'Route deleted' });
});

export const getRouteOccupancyHandler = catchAsync(async (req, res) => {
  const route = await getRouteById(req.params.id);
  const currentOccupancy = await getRouteOccupancy(req.params.id);
  return sendSuccess(res, 200, { capacity: route.capacity, currentOccupancy });
});