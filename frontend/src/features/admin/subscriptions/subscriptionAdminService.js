import axiosInstance from '../../../services/axiosInstance.js';

export const fetchAllSubscriptions = (params = {}) =>
  axiosInstance.get('/admin/subscriptions', { params }).then((res) => res.data.data);

export const fetchPendingSubscriptions = () =>
  axiosInstance.get('/admin/subscriptions/pending').then((res) => res.data.data.subscriptions);

export const assignRouteRequest = (subscriptionId, payload) =>
  axiosInstance
    .put(`/admin/subscriptions/${subscriptionId}/assign`, payload)
    .then((res) => res.data.data);