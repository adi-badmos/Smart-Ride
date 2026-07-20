import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { getDriverProfileByUserId } from '../services/driver.service.js';
import { listMyPayouts } from '../services/payout.service.js';

export const getMyPayouts = catchAsync(async (req, res) => {
  const driverProfile = await getDriverProfileByUserId(req.user._id);
  if (!driverProfile) throw new AppError('Driver profile not found', 404);

  const payouts = await listMyPayouts(driverProfile._id);
  return sendSuccess(res, 200, { payouts });
});