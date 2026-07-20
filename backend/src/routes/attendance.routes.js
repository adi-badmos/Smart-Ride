import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { markAttendanceRules, routeDateParamRules } from '../validators/attendance.validator.js';
import {
  markAttendanceHandler,
  getRouteAttendanceHandler,
  getMyAttendanceHandler,
} from '../controllers/attendance.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.post(
  '/mark',
  protect,
  authorize(ROLES.DRIVER),
  markAttendanceRules,
  validate,
  markAttendanceHandler
);

router.get(
  '/route/:routeId/date/:date',
  protect,
  authorize(ROLES.DRIVER),
  routeDateParamRules,
  validate,
  getRouteAttendanceHandler
);

router.get('/my-attendance', protect, authorize(ROLES.USER), getMyAttendanceHandler);

export default router;