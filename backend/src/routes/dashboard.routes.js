import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { getStatsHandler, getRevenueHandler, getTrendsHandler } from '../controllers/dashboard.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/stats', getStatsHandler);
router.get('/revenue', getRevenueHandler);
router.get('/trends', getTrendsHandler);

export default router;