import axiosInstance from '../../../services/axiosInstance.js';

export const markAttendanceRequest = (payload) =>
  axiosInstance.post('/attendance/mark', payload).then((res) => res.data.data.attendance);

export const fetchRouteAttendance = (routeId, date) =>
  axiosInstance.get(`/attendance/route/${routeId}/date/${date}`).then((res) => res.data.data.records);