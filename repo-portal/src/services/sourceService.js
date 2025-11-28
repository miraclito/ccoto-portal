import api from './api';

const sourceService = {
    // Obtener todas las fuentes
    getSources: () => api.get('/sources'),

    // Crear fuente
    createSource: (data) => api.post('/sources', data),

    // Actualizar fuente
    updateSource: (id, data) => api.put(`/sources/${id}`, data),

    // Eliminar fuente
    deleteSource: (id) => api.delete(`/sources/${id}`),

    // Probar scraper
    testScraper: (data) => api.post('/sources/test', data)
};

export default sourceService;
