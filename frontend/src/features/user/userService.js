import axiosInstance from '../../services/axiosInstance.js';

export const updateProfileRequest = (payload) =>
  axiosInstance.put('/users/me', payload).then((res) => res.data.data.user);

export const changePasswordRequest = (payload) =>
  axiosInstance.put('/users/me/change-password', payload).then((res) => res.data.data);