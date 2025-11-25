import api from './api';

const scraperService = {
  // Ejecutar scraping
  runScraping: async () => {
    const response = await api.post('/scraper/run');
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/scraper/stats');
    return response.data;
  },
};

export default scraperService;

