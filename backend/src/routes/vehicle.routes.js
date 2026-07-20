import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createVehicleRules, updateVehicleRules } from '../validators/vehicle.validator.js';
import {
  createVehicleHandler,
  getVehicles,
  getVehicle,
  updateVehicleHandler,
  deleteVehicleHandler,
} from '../controllers/vehicle.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', getVehicles);
router.post('/', createVehicleRules, validate, createVehicleHandler);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicleRules, validate, updateVehicleHandler);
router.delete('/:id', deleteVehicleHandler);

export default router;