import axiosInstance from '../../../services/axiosInstance.js';

export const fetchRoutes = (params = {}) =>
  axiosInstance.get('/admin/routes', { params }).then((res) => res.data.data);

export const fetchRouteById = (id) =>
  axiosInstance.get(`/admin/routes/${id}`).then((res) => res.data.data.route);

export const createRouteRequest = (payload) =>
  axiosInstance.post('/admin/routes', payload).then((res) => res.data.data.route);

export const updateRouteRequest = (id, payload) =>
  axiosInstance.put(`/admin/routes/${id}`, payload).then((res) => res.data.data.route);

export const deleteRouteRequest = (id) =>
  axiosInstance.delete(`/admin/routes/${id}`).then((res) => res.data.data);

export const fetchRouteOccupancy = (id) =>
  axiosInstance.get(`/admin/routes/${id}/occupancy`).then((res) => res.data.data);