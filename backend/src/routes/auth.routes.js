import { Router } from 'express';
import { register, login, logout, refreshTokenHandler } from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshTokenHandler);

export default router;