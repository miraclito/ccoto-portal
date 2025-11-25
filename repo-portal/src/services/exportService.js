// src/services/exportService.js
import api from './api';

// Helper genérico para pedir CSV al backend
const fetchCsv = async (url, params = {}) => {
  const response = await api.get(url, {
    params,
    responseType: 'blob', // importante para descargar archivos
  });
  return response.data; // blob
};

const exportService = {
  exportNews: (params = {}) => fetchCsv('/export/news', params),
  exportCategories: (params = {}) => fetchCsv('/export/categories', params),
  exportStats: (params = {}) => fetchCsv('/export/stats', params),
};

export default exportService;
