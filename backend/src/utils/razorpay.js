import Razorpay from 'razorpay';
import { env } from '../config/env.js';

// Placeholder credentials until real keys are provided. The SDK
// initializes fine either way — any actual API call (orders.create) will
// fail with a Razorpay auth error until RAZORPAY_KEY_ID/KEY_SECRET are
// real, which createOrder below catches and reports as a clear 502.
export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});