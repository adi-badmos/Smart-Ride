import axiosInstance from '../../services/axiosInstance.js';

export const createComplaintRequest = (payload) =>
  axiosInstance.post('/complaints', payload).then((res) => res.data.data.complaint);

export const fetchMyComplaints = () =>
  axiosInstance.get('/complaints/my-complaints').then((res) => res.data.data.complaints);

export const fetchComplaintById = (id) =>
  axiosInstance.get(`/complaints/${id}`).then((res) => res.data.data.complaint);