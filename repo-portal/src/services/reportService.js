// src/services/reportService.js
import api from './api';

const reportService = {
  getOverview: async () => {
    const response = await api.get('/reports/overview');
    return response.data; // { success, data: {...} }
  },
  getByCategory: async () => {
    const response = await api.get('/reports/by-category');
    return response.data; // { success, data: [...] }
  },
  getTimeSeries: async (days = 30) => {
    const response = await api.get('/reports/time-series', {
      params: { days },
    });
    return response.data; // { success, data: [...] }
  },
};

export default reportService;
