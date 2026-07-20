import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateUserStatusRules, verifyDriverRules } from '../validators/admin.validator.js';
import { createDriverRules } from '../validators/driver.validator.js';
import { assignRouteRules } from '../validators/subscription.validator.js';
import { updateComplaintRules } from '../validators/complaint.validator.js';
import { createPayoutRules, updatePayoutRules } from '../validators/payout.validator.js';
import {
  getUsers,
  getUser,
  setUserStatus,
  createDriver,
  getDrivers,
  getDriverDetail,
  verifyDriverHandler,
  getSubscriptions,
  getPendingSubscriptions,
  assignRouteHandler,
  getComplaints,
  updateComplaintHandler,
  getPayouts,
  createPayoutHandler,
  updatePayoutHandler,
} from '../controllers/admin.controller.js';
import { getAttendanceHistoryHandler } from '../controllers/attendance.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/status', updateUserStatusRules, validate, setUserStatus);

router.post('/drivers', createDriverRules, validate, createDriver);
router.get('/drivers', getDrivers);
router.get('/drivers/:id', getDriverDetail);
router.put('/drivers/:id/verify', verifyDriverRules, validate, verifyDriverHandler);

router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/pending', getPendingSubscriptions);
router.put('/subscriptions/:id/assign', assignRouteRules, validate, assignRouteHandler);

router.get('/attendance/history', getAttendanceHistoryHandler);

router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaintRules, validate, updateComplaintHandler);

router.get('/payouts', getPayouts);
router.post('/payouts', createPayoutRules, validate, createPayoutHandler);
router.put('/payouts/:id', updatePayoutRules, validate, updatePayoutHandler);

export default router;