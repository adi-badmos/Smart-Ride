import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ['service', 'driver', 'route', 'payment', 'other'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    adminResponse: { type: String, trim: true, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);