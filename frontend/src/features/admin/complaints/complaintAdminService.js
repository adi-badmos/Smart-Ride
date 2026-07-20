import axiosInstance from '../../../services/axiosInstance.js';

export const fetchAllComplaints = (params = {}) =>
  axiosInstance.get('/admin/complaints', { params }).then((res) => res.data.data);

export const updateComplaintRequest = (id, payload) =>
  axiosInstance.put(`/admin/complaints/${id}`, payload).then((res) => res.data.data.complaint);