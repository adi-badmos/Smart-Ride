import { Complaint } from '../models/complaint.model.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginationMeta } from '../utils/paginate.js';

export const createComplaint = async (userId, { subject, description, type, priority }) => {
  return Complaint.create({ user: userId, subject, description, type, priority });
};

export const listMyComplaints = async (userId) => {
  return Complaint.find({ user: userId }).sort({ createdAt: -1 });
};

export const getMyComplaintById = async (userId, id) => {
  const complaint = await Complaint.findOne({ _id: id, user: userId });
  if (!complaint) throw new AppError('Complaint not found', 404);
  return complaint;
};

export const listAllComplaints = async (reqQuery = {}) => {
  const { status, type, priority } = reqQuery;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const { page, limit, skip } = getPagination(reqQuery);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Complaint.countDocuments(filter),
  ]);
  return { complaints, pagination: buildPaginationMeta(page, limit, total) };
};

export const updateComplaint = async (id, { status, adminResponse, priority }) => {
  const updates = {};
  if (status !== undefined) {
    updates.status = status;
    updates.resolvedAt = ['resolved', 'closed'].includes(status) ? new Date() : null;
  }
  if (adminResponse !== undefined) updates.adminResponse = adminResponse;
  if (priority !== undefined) updates.priority = priority;

  const complaint = await Complaint.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!complaint) throw new AppError('Complaint not found', 404);
  return complaint;
};