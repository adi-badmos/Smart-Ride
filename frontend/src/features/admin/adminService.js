import axiosInstance from '../../services/axiosInstance.js';

export const fetchUsers = (params = {}) =>
  axiosInstance.get('/admin/users', { params }).then((res) => res.data.data);

export const fetchUserById = (id) =>
  axiosInstance.get(`/admin/users/${id}`).then((res) => res.data.data.user);

export const updateUserStatusRequest = (id, isActive) =>
  axiosInstance.put(`/admin/users/${id}/status`, { isActive }).then((res) => res.data.data.user);

export const fetchDrivers = (params = {}) =>
  axiosInstance.get('/admin/drivers', { params }).then((res) => res.data.data.drivers);

export const fetchDriverById = (id) =>
  axiosInstance.get(`/admin/drivers/${id}`).then((res) => res.data.data.driver);

export const createDriverRequest = (payload) =>
  axiosInstance.post('/admin/drivers', payload).then((res) => res.data.data);

export const verifyDriverRequest = (id, status) =>
  axiosInstance.put(`/admin/drivers/${id}/verify`, { status }).then((res) => res.data.data.driverProfile);