import axiosInstance from '../../../services/axiosInstance.js';

export const fetchVehicles = (params = {}) =>
  axiosInstance.get('/admin/vehicles', { params }).then((res) => res.data.data);

export const fetchVehicleById = (id) =>
  axiosInstance.get(`/admin/vehicles/${id}`).then((res) => res.data.data.vehicle);

export const createVehicleRequest = (payload) =>
  axiosInstance.post('/admin/vehicles', payload).then((res) => res.data.data.vehicle);

export const updateVehicleRequest = (id, payload) =>
  axiosInstance.put(`/admin/vehicles/${id}`, payload).then((res) => res.data.data.vehicle);

export const deleteVehicleRequest = (id) =>
  axiosInstance.delete(`/admin/vehicles/${id}`).then((res) => res.data.data);