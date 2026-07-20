import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['license', 'id_proof', 'address_proof', 'vehicle_rc'], required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { _id: true }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    bankName: { type: String, trim: true },
  },
  { _id: false }
);

const driverProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    documents: { type: [documentSchema], default: [] },
    // Default is now 'pending' — Tier 2's real pending -> in_review ->
    // approved/rejected workflow (this phase) is the standard path going
    // forward. Admin-direct creation (driver.service.js:createDriverAccount,
    // Phase 4) explicitly overrides this to 'approved' at create time,
    // since that path bypasses self-service documents entirely.
    verificationStatus: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending',
    },
    isAvailable: { type: Boolean, default: true },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);