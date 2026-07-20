import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false }
);

const payoutSchema = new mongoose.Schema(
  {
    driverProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: periodSchema, required: true },
    status: { type: String, enum: ['pending', 'processed', 'paid', 'failed'], default: 'pending' },
    transactionRef: { type: String, trim: true, default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Payout = mongoose.model('Payout', payoutSchema);