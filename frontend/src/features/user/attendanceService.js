import axiosInstance from '../../services/axiosInstance.js';

export const fetchMyAttendance = () =>
  axiosInstance.get('/attendance/my-attendance').then((res) => res.data.data.records);