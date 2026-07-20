import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateMeRules, changePasswordRules } from '../validators/user.validator.js';
import { getMe, updateMe, changePassword } from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMeRules, validate, updateMe);
router.put('/me/change-password', changePasswordRules, validate, changePassword);

export default router;