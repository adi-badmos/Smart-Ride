import crypto from 'crypto';
import { Payment } from '../models/payment.model.js';
import { Subscription } from '../models/subscription.model.js';
import { AppError } from '../utils/AppError.js';
import { SUBSCRIPTION_STATUS, NOTIFICATION_TYPES } from '../utils/constants.js';
import { send } from './notificationService.js';
import { razorpay } from '../utils/razorpay.js';
import { env } from '../config/env.js';

const generateReceipt = () => `RCPT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// --- Tier 1 mock — kept intact as a dev/test shortcut. The frontend's
// primary checkout flow now uses the real gateway below, but this
// endpoint still works exactly as it did in Phase 7. ---
export const mockPay = async (userId, subscriptionId) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId })
    .populate('plan')
    .populate('user', 'name email');
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  if (subscription.status !== SUBSCRIPTION_STATUS.PAYMENT_PENDING) {
    throw new AppError(
      `Cannot pay for a subscription with status ${subscription.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const payment = await Payment.create({
    user: userId,
    subscription: subscription._id,
    method: 'mock',
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    amount: subscription.plan.price,
    currency: 'INR',
    status: 'captured',
    receipt: generateReceipt(),
  });

  subscription.paymentId = payment._id;
  subscription.status = SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT;
  await subscription.save();

  await send(NOTIFICATION_TYPES.PAYMENT_SUCCESS, {
    userEmail: subscription.user.email,
    userName: subscription.user.name,
    amount: payment.amount,
    planName: subscription.plan.name,
  });

  return { subscription, payment };
};

// --- Tier 2: real Razorpay, one-time order-based per subscription period ---

export const createOrder = async (userId, subscriptionId) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId }).populate('plan');
  if (!subscription) throw new AppError('Subscription not found', 404);

  if (subscription.status !== SUBSCRIPTION_STATUS.PAYMENT_PENDING) {
    throw new AppError(
      `Cannot pay for a subscription with status ${subscription.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const amountInPaise = Math.round(subscription.plan.price * 100);
  const receipt = generateReceipt();

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: { subscriptionId: subscription._id.toString(), userId: userId.toString() },
    });
  } catch (err) {
    throw new AppError(
      'Payment gateway is not reachable right now — check Razorpay credentials.',
      502,
      'GATEWAY_ERROR'
    );
  }

  const payment = await Payment.create({
    user: userId,
    subscription: subscription._id,
    method: 'razorpay',
    razorpayOrderId: order.id,
    amount: subscription.plan.price,
    currency: 'INR',
    status: 'created',
    receipt,
  });

  subscription.paymentId = payment._id;
  await subscription.save();

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID,
  };
};

// Signature check only — confirms the checkout callback wasn't tampered
// with, so the frontend can show an immediate "processing" state. This
// does NOT transition the subscription. Per the architecture decisions,
// the webhook below is the single source of truth for that — a frontend
// callback alone is never trusted for the business-critical transition.
export const verifyPaymentSignature = async (
  userId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  const payment = await Payment.findOne({ user: userId, razorpayOrderId: razorpay_order_id });
  if (!payment) throw new AppError('Payment record not found', 404);

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!isValid) {
    throw new AppError('Payment signature verification failed', 400, 'INVALID_SIGNATURE');
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  if (payment.status === 'created') {
    payment.status = 'authorized';
    await payment.save();
  }

  return { verified: true };
};

export const listMyPayments = async (userId) => {
  return Payment.find({ user: userId }).populate('subscription', 'plan status').sort({ createdAt: -1 });
};

export const getMyPaymentById = async (userId, id) => {
  const payment = await Payment.findOne({ _id: id, user: userId }).populate({
    path: 'subscription',
    populate: { path: 'plan' },
  });
  if (!payment) throw new AppError('Payment not found', 404);
  return payment;
};

// --- Webhook: the single source of truth for a captured payment ---

export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret')
    .update(rawBody)
    .digest('hex');
  return (
    expected.length === signatureHeader.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  );
};

export const processWebhookEvent = async (event) => {
  const eventType = event.event;

  if (eventType === 'payment.captured') {
    const entity = event.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (!payment) {
      return { handled: false }; // unrecognized order — acknowledge anyway so Razorpay stops retrying
    }

    // Idempotent — a duplicate webhook delivery for an already-captured
    // payment is a no-op, not a re-transition or a second notification.
    if (payment.status === 'captured') {
      return { handled: true, idempotent: true };
    }

    payment.status = 'captured';
    payment.razorpayPaymentId = entity.id;
    await payment.save();

    const subscription = await Subscription.findById(payment.subscription)
      .populate('plan')
      .populate('user', 'name email');

    if (subscription && subscription.status === SUBSCRIPTION_STATUS.PAYMENT_PENDING) {
      subscription.status = SUBSCRIPTION_STATUS.WAITING_ASSIGNMENT;
      await subscription.save();

      await send(NOTIFICATION_TYPES.PAYMENT_SUCCESS, {
        userEmail: subscription.user.email,
        userName: subscription.user.name,
        amount: payment.amount,
        planName: subscription.plan.name,
      });
    }

    return { handled: true, idempotent: false };
  }

  if (eventType === 'payment.failed') {
    const entity = event.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (payment && payment.status !== 'captured') {
      payment.status = 'failed';
      await payment.save();
    }
    return { handled: true };
  }

  return { handled: false };
};