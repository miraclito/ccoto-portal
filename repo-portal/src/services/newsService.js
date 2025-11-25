// src/services/newsService.js
import api from './api';

// 🔹 Obtener listado de noticias (con paginación y filtros)
export const getNews = async (params = {}) => {
  const response = await api.get('/news', { params });
  const payload = response.data || {};

  if (payload.success && payload.data && payload.data.news) {
    const { news, pagination } = payload.data;
    return {
      news,
      totalPages: pagination?.totalPages || 1,
      currentPage: pagination?.page || params.page || 1,
      total: pagination?.total || news.length,
    };
  }

  return {
    news: [],
    totalPages: 1,
    currentPage: 1,
    total: 0,
  };
};

// 🔹 Alias para compatibilidad con tu ManageNews
export const getAllNews = getNews;

// 🔹 Obtener una noticia por ID
export const getNewsById = async (id) => {
  const res = await api.get(`/news/${id}`);
  if (res.data.success && res.data.data) return res.data.data;

  throw new Error("No se pudo obtener la noticia");
};

// 🔹 Crear noticia (usa multipart/form-data)
export const createNews = async (formData) => {
  const res = await api.post(`/news`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔹 Editar noticia
export const updateNews = async (id, formData) => {
  const res = await api.put(`/news/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔹 Eliminar noticia
export const deleteNews = async (id) => {
  const res = await api.delete(`/news/${id}`);
  return res.data;
};

const newsService = {
  getNews,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};

export default newsService;
