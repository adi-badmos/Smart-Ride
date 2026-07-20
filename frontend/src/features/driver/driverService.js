import axiosInstance from '../../services/axiosInstance.js';

export const fetchMyRoute = () =>
  axiosInstance.get('/drivers/my-route').then((res) => res.data.data.route);

export const fetchMyCommuters = () =>
  axiosInstance.get('/drivers/my-commuters').then((res) => res.data.data.commuters);

export const registerDriverRequest = (payload) =>
  axiosInstance.post('/drivers/register', payload).then((res) => res.data.data);

export const fetchMyDriverProfile = () =>
  axiosInstance.get('/drivers/profile').then((res) => res.data.data.driverProfile);

export const updateMyDriverProfileRequest = (payload) =>
  axiosInstance.put('/drivers/profile', payload).then((res) => res.data.data.driverProfile);

export const uploadDocumentRequest = (formData) =>
  axiosInstance
    .post('/drivers/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data.data.driverProfile);