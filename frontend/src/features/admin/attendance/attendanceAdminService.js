import axiosInstance from '../../../services/axiosInstance.js';

export const fetchAttendanceHistory = (params = {}) =>
  axiosInstance.get('/admin/attendance/history', { params }).then((res) => res.data.data);