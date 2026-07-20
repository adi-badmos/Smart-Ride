import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRouteRules, updateRouteRules } from '../validators/route.validator.js';
import {
  createRouteHandler,
  getRoutes,
  getRoute,
  updateRouteHandler,
  deleteRouteHandler,
  getRouteOccupancyHandler,
} from '../controllers/route.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', getRoutes);
router.post('/', createRouteRules, validate, createRouteHandler);
router.get('/:id', getRoute);
router.put('/:id', updateRouteRules, validate, updateRouteHandler);
router.delete('/:id', deleteRouteHandler);
router.get('/:id/occupancy', getRouteOccupancyHandler);

export default router;