// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import NewsList from '../components/news/NewsList';
import { getNews } from '../services/newsService';
import categoryService from '../services/categoryService';

// Helper para mostrar/extraer la fuente desde sourceUrl / campos opcionales
const extractSourceName = (item) => {
  if (!item) return '';
  if (item.sourceName) return item.sourceName;
  if (item.source) return item.source;
  if (item.sourceUrl) {
    try {
      const hostname = new URL(item.sourceUrl).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return 'Fuente externa';
    }
  }
  return 'Original';
};

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // filtros
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest | oldest

  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  // paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce del buscador (espera 500ms para no pegarle tanto a la API)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Cargar categorías una sola vez
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories(); // 👈 CORREGIDO

        // res viene de categoryService, que devuelve response.data
        if (Array.isArray(res)) {
          setCategories(res);
        } else if (Array.isArray(res?.data)) {
          setCategories(res.data);
        } else if (Array.isArray(res?.categories)) {
          setCategories(res.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error cargando categorías', err);
      }
    };

    loadCategories();
  }, []);

  // Cargar noticias cuando cambian filtros/página
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError('');

      try {
        const { news: fetchedNews, totalPages: apiTotalPages } = await getNews({
          search: debouncedSearch,
          categoryId: selectedCategoryId || '',
          page,
          limit: 12,
          isPublished: true,
        });

        setNews(fetchedNews || []);
        setTotalPages(apiTotalPages || 1);

        // construir lista de fuentes únicas a partir de las noticias
        const uniqueSources = Array.from(
          new Set(
            (fetchedNews || [])
              .map((n) => extractSourceName(n))
              .filter((name) => !!name)
          )
        );
        setSources(uniqueSources);
      } catch (err) {
        console.error(err);
        setError('Ocurrió un error al cargar las noticias.');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadNews();
  }, [debouncedSearch, selectedCategoryId, page]);

  // Aplicar filtros de fuente y orden en el FRONT (no en la BD)
  let processedNews = [...news];

  if (selectedSource) {
    processedNews = processedNews.filter(
      (item) => extractSourceName(item) === selectedSource
    );
  }

  if (sortBy === 'latest') {
    processedNews.sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt || 0);
      const db = new Date(b.publishedAt || b.createdAt || 0);
      return db - da; // más recientes primero
    });
  } else if (sortBy === 'oldest') {
    processedNews.sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt || 0);
      const db = new Date(b.publishedAt || b.createdAt || 0);
      return da - db; // más antiguas primero
    });
  }

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategoryId('');
    setSelectedSource('');
    setSortBy('latest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* OJO: Navbar y Footer ya vienen desde App.js, aquí NO los usamos */}

      {/* Encabezado */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Portal de Noticias
            </h1>
            <p className="text-sm text-gray-500">
              Noticias actualizadas desde diferentes medios, gestionadas con tu
              sistema de scraping.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="mt-2 sm:mt-0 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Limpiar filtros
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          {/* Buscador */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por título o contenido..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Categoría (usa categoryId real) */}
          <div className="md:w-44">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Categoría
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fuente (filtrado en frontend) */}
          <div className="md:w-44">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fuente
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div className="md:w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <NewsList news={processedNews} loading={loading && !initialLoading} />

          {/* Paginación backend */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-3 py-1 rounded-md text-sm border ${
                  page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página <span className="font-semibold">{page}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded-md text-sm border ${
                  page >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
