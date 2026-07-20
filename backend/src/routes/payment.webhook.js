import { Router } from 'express';
import { webhookHandler } from '../controllers/payment.controller.js';

const router = Router();

// Body is a raw Buffer here, not JSON — see app.js, where express.raw()
// is mounted on this exact path BEFORE the global express.json()
// middleware. HMAC signature verification needs the untouched raw bytes.
router.post('/', webhookHandler);

export default router;