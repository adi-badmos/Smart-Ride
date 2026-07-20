import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createComplaintRules } from '../validators/complaint.validator.js';
import {
  createComplaintHandler,
  getMyComplaints,
  getMyComplaintDetail,
} from '../controllers/complaint.controller.js';

const router = Router();

// Any authenticated role can file a complaint — not restricted to
// ROLES.USER, since the type enum includes 'driver'/'route'/etc. and a
// complaint is inherently tied to whoever is logged in, not a specific role.
router.use(protect);

router.post('/', createComplaintRules, validate, createComplaintHandler);
router.get('/my-complaints', getMyComplaints);
router.get('/:id', getMyComplaintDetail);

export default router;