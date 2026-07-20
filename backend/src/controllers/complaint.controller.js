import { catchAsync } from '../middlewares/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createComplaint,
  listMyComplaints,
  getMyComplaintById,
} from '../services/complaint.service.js';

export const createComplaintHandler = catchAsync(async (req, res) => {
  const { subject, description, type, priority } = req.body;
  const complaint = await createComplaint(req.user._id, { subject, description, type, priority });
  return sendSuccess(res, 201, { complaint });
});

export const getMyComplaints = catchAsync(async (req, res) => {
  const complaints = await listMyComplaints(req.user._id);
  return sendSuccess(res, 200, { complaints });
});

export const getMyComplaintDetail = catchAsync(async (req, res) => {
  const complaint = await getMyComplaintById(req.user._id, req.params.id);
  return sendSuccess(res, 200, { complaint });
});