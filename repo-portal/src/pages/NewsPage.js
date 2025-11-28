import React, { useEffect, useState } from 'react';
import NewsList from '../components/news/NewsList';
import { getNews } from '../services/newsService';
import categoryService from '../services/categoryService';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(Array.isArray(res) ? res : (res.data || []));
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Cargar noticias
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Nota: Ajusta los parámetros según lo que soporte tu backend
        const params = {
          page,
          limit: 12,
          search: debouncedSearch,
          categoryId: selectedCategory,
          isPublished: true,
          // sortBy se manejaría en backend idealmente, o en frontend si son pocos datos
        };

        const res = await getNews(params);

        // Ajustar según la respuesta real de tu API
        const newsData = res.news || [];
        const total = res.totalPages || 1;

        // Ordenamiento en frontend si el backend no lo soporta directamente en este endpoint
        let sortedNews = [...newsData];
        if (sortBy === 'latest') {
          sortedNews.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
        } else if (sortBy === 'oldest') {
          sortedNews.sort((a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt));
        }

        setNews(sortedNews);
        setTotalPages(total);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [debouncedSearch, selectedCategory, page, sortBy]);

  return (
    <div className="min-h-screen bg-secondary-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-secondary-900 mb-4">
            Explora Noticias
          </h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
            Busca y filtra entre miles de artículos de las fuentes más confiables.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-4 mb-8 sticky top-24 z-30">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-secondary-200 rounded-xl leading-5 bg-secondary-50 placeholder-secondary-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
                placeholder="Buscar noticias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="block w-full md:w-auto pl-3 pr-10 py-2.5 text-base border border-secondary-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl bg-white"
              >
                <option value="">Todas las Categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full md:w-auto pl-3 pr-10 py-2.5 text-base border border-secondary-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl bg-white"
              >
                <option value="latest">Más Recientes</option>
                <option value="oldest">Más Antiguas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          <NewsList news={news} loading={loading} />

          {!loading && news.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-secondary-900">No se encontraron noticias</h3>
              <p className="mt-1 text-secondary-500">Intenta ajustar tus filtros de búsqueda.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-secondary-200 rounded-lg text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-50 rounded-lg border border-transparent">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-secondary-200 rounded-lg text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
