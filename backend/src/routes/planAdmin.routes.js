import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPlanRules, updatePlanRules } from '../validators/plan.validator.js';
import {
  createPlanHandler,
  getPlansAdminHandler,
  getPlanHandler,
  updatePlanHandler,
  deactivatePlanHandler,
} from '../controllers/plan.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', getPlansAdminHandler);
router.post('/', createPlanRules, validate, createPlanHandler);
router.get('/:id', getPlanHandler);
router.put('/:id', updatePlanRules, validate, updatePlanHandler);
// Soft-delete only — see plan.service.js:deactivatePlan.
router.delete('/:id', deactivatePlanHandler);

export default router;