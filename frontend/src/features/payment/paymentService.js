import axiosInstance from '../../services/axiosInstance.js';

export const mockPayRequest = (subscriptionId) =>
  axiosInstance.post('/payments/mock-pay', { subscriptionId }).then((res) => res.data.data);

export const createOrderRequest = (subscriptionId) =>
  axiosInstance.post('/payments/create-order', { subscriptionId }).then((res) => res.data.data);

export const verifyPaymentRequest = (payload) =>
  axiosInstance.post('/payments/verify', payload).then((res) => res.data.data);

export const fetchMyPayments = () =>
  axiosInstance.get('/payments/my-payments').then((res) => res.data.data.payments);

export const fetchPaymentById = (id) =>
  axiosInstance.get(`/payments/${id}`).then((res) => res.data.data.payment);