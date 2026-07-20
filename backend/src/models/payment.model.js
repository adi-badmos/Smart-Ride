import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    method: { type: String, enum: ['mock', 'razorpay'], required: true },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'authorized', 'captured', 'failed', 'refunded'], required: true },
    receipt: { type: String, required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);