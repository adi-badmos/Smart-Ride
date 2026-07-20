import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', required: true },
    date: { type: Date, required: true }, // normalized to midnight UTC — see attendance.service.js
    status: { type: String, enum: ['present', 'absent', 'leave'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupTime: { type: String, default: null },
    dropTime: { type: String, default: null },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// "Duplicate marks for the same subscription+day are rejected" — per spec.
attendanceSchema.index({ subscription: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);