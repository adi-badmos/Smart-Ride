import axiosInstance from '../../../services/axiosInstance.js';

export const fetchPlansAdmin = () =>
  axiosInstance.get('/admin/plans').then((res) => res.data.data.plans);

export const createPlanRequest = (payload) =>
  axiosInstance.post('/admin/plans', payload).then((res) => res.data.data.plan);

export const updatePlanRequest = (id, payload) =>
  axiosInstance.put(`/admin/plans/${id}`, payload).then((res) => res.data.data.plan);

export const deactivatePlanRequest = (id) =>
  axiosInstance.delete(`/admin/plans/${id}`).then((res) => res.data.data.plan);