import axiosInstance from '../../services/axiosInstance.js';

export const fetchPlans = () => axiosInstance.get('/plans').then((res) => res.data.data.plans);

export const createSubscriptionRequest = (payload) =>
  axiosInstance.post('/subscriptions', payload).then((res) => res.data.data.subscription);

export const fetchMySubscriptions = () =>
  axiosInstance.get('/subscriptions/my-subscriptions').then((res) => res.data.data.subscriptions);

export const fetchSubscriptionById = (id) =>
  axiosInstance.get(`/subscriptions/${id}`).then((res) => res.data.data.subscription);

export const cancelSubscriptionRequest = (id) =>
  axiosInstance.put(`/subscriptions/${id}/cancel`).then((res) => res.data.data.subscription);