import axiosInstance from '../../../services/axiosInstance.js';

export const fetchAllPayouts = (params = {}) =>
  axiosInstance.get('/admin/payouts', { params }).then((res) => res.data.data);

export const createPayoutRequest = (payload) =>
  axiosInstance.post('/admin/payouts', payload).then((res) => res.data.data.payout);

export const updatePayoutRequest = (id, payload) =>
  axiosInstance.put(`/admin/payouts/${id}`, payload).then((res) => res.data.data.payout);