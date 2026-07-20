import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ['sedan', 'suv', 'van', 'bus'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    insuranceExpiry: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    driverProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', default: null },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);