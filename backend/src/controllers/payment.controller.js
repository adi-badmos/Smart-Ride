import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import {
  mockPay,
  createOrder,
  verifyPaymentSignature,
  listMyPayments,
  getMyPaymentById,
  verifyWebhookSignature,
  processWebhookEvent,
} from '../services/payment.service.js';

export const mockPayHandler = catchAsync(async (req, res) => {
  const { subscriptionId } = req.body;
  const result = await mockPay(req.user._id, subscriptionId);
  return sendSuccess(res, 200, result);
});

export const createOrderHandler = catchAsync(async (req, res) => {
  const { subscriptionId } = req.body;
  const result = await createOrder(req.user._id, subscriptionId);
  return sendSuccess(res, 201, result);
});

export const verifyPaymentHandler = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const result = await verifyPaymentSignature(req.user._id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return sendSuccess(res, 200, result);
});

export const getMyPayments = catchAsync(async (req, res) => {
  const payments = await listMyPayments(req.user._id);
  return sendSuccess(res, 200, { payments });
});

export const getMyPaymentDetail = catchAsync(async (req, res) => {
  const payment = await getMyPaymentById(req.user._id, req.params.id);
  return sendSuccess(res, 200, { payment });
});

// No catchAsync/AppError envelope here on purpose — Razorpay calls this
// directly (no browser, no auth cookie) and just needs a fast 200/400,
// not our standard JSON error shape. req.body is a raw Buffer, per the
// express.raw() mount in app.js — required so the HMAC signature check
// runs against the untouched bytes Razorpay actually signed.
export const webhookHandler = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!verifyWebhookSignature(req.body, signature)) {
    logger.warn('Rejected a Razorpay webhook with an invalid signature');
    return res.status(400).json({ success: false, error: { message: 'Invalid signature' } });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: 'Invalid payload' } });
  }

  try {
    await processWebhookEvent(event);
  } catch (err) {
    // Already logged for investigation — still ack with 200 so Razorpay
    // doesn't hammer retries indefinitely for something now on record.
    logger.error(`Webhook processing error: ${err.message}`);
  }

  return res.status(200).json({ success: true });
};