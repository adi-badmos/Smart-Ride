import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  return sendSuccess(res, 200, {
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

export default router;