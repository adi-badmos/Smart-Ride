import axiosInstance from '../../services/axiosInstance.js';

export const fetchDashboardStats = () =>
  axiosInstance.get('/admin/dashboard/stats').then((res) => res.data.data);

export const fetchRevenue = () =>
  axiosInstance.get('/admin/dashboard/revenue').then((res) => res.data.data);

export const fetchTrends = () =>
  axiosInstance.get('/admin/dashboard/trends').then((res) => res.data.data);