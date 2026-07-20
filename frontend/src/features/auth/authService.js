import axiosInstance from '../../services/axiosInstance.js';

export const registerRequest = (payload) =>
  axiosInstance.post('/auth/register', payload).then((res) => res.data.data);

export const loginRequest = (payload) =>
  axiosInstance.post('/auth/login', payload).then((res) => res.data.data);

export const logoutRequest = () =>
  axiosInstance.post('/auth/logout').then((res) => res.data.data);

export const fetchCurrentUser = () =>
  axiosInstance.get('/users/me').then((res) => res.data.data.user);