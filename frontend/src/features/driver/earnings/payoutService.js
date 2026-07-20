import axiosInstance from '../../../services/axiosInstance.js';

export const fetchMyPayouts = () =>
  axiosInstance.get('/drivers/my-payouts').then((res) => res.data.data.payouts);