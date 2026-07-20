import { Payout } from '../models/payout.model.js';
import { DriverProfile } from '../models/driverProfile.model.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

export const createPayout = async ({ driverProfileId, amount, period }) => {
  const driverExists = await DriverProfile.exists({ _id: driverProfileId });
  if (!driverExists) throw new AppError('Driver does not exist', 400, 'INVALID_DRIVER_REF');

  return Payout.create({ driverProfile: driverProfileId, amount, period });
};

export const listAllPayouts = async (reqQuery = {}) => {
  const { status } = reqQuery;
  const filter = {};
  if (status) filter.status = status;

  const { page, limit, skip } = getPagination(reqQuery);
  const [payouts, total] = await Promise.all([
    Payout.find(filter)
      .populate({ path: 'driverProfile', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payout.countDocuments(filter),
  ]);
  return { payouts, pagination: buildPaginationMeta(page, limit, total) };
};

export const updatePayoutStatus = async (id, { status, transactionRef }) => {
  const updates = { status };
  if (transactionRef !== undefined) updates.transactionRef = transactionRef;
  if (status !== 'pending') {
    const existing = await Payout.findById(id);
    if (existing && !existing.processedAt) {
      updates.processedAt = new Date();
    }
  }

  const payout = await Payout.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!payout) throw new AppError('Payout not found', 404);
  return payout;
};

export const listMyPayouts = async (driverProfileId) => {
  return Payout.find({ driverProfile: driverProfileId }).sort({ createdAt: -1 });
};