import React, { useEffect, useState } from 'react';
import NewsList from '../components/news/NewsList';
import { getNews } from '../services/newsService';
import categoryService from '../services/categoryService';

const Home = () => {
  const [news, setNews] = useState([]);
  const [heroNews, setHeroNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        const catRes = await categoryService.getAllCategories();
        const cats = Array.isArray(catRes) ? catRes : (catRes.data || []);
        setCategories(cats);

        // Cargar noticias
        const newsRes = await getNews({
          limit: 13, // 1 para Hero + 12 para grid
          isPublished: true,
          categoryId: selectedCategory
        });

        const allNews = newsRes.news || [];
        if (allNews.length > 0) {
          setHeroNews(allNews[0]);
          setNews(allNews.slice(1));
        } else {
          setHeroNews(null);
          setNews([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-secondary-900 text-white pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/50 to-transparent"></div>

        <div className="container mx-auto relative z-10">
          {loading ? (
            <div className="animate-pulse h-96 bg-secondary-800 rounded-3xl"></div>
          ) : heroNews ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <span className="inline-block px-4 py-1.5 bg-primary-600 text-white text-sm font-bold rounded-full shadow-lg shadow-primary-500/30 mb-4">
                  🔥 Noticia Destacada
                </span>
                <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                  {heroNews.title}
                </h1>
                <p className="text-lg text-secondary-300 line-clamp-3">
                  {heroNews.summary || heroNews.content?.substring(0, 200)}
                </p>
                <button
                  onClick={() => window.location.href = `/news/${heroNews.id}`}
                  className="btn-primary mt-4 inline-flex items-center gap-2"
                >
                  Leer historia completa
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              <div className="relative group cursor-pointer" onClick={() => window.location.href = `/news/${heroNews.id}`}>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video">
                  <img
                    src={heroNews.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop'}
                    alt={heroNews.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-secondary-400">No hay noticias destacadas por el momento.</h2>
            </div>
          )}
        </div>
      </section>

      {/* Categories & Content */}
      <section className="py-16 container mx-auto px-4">
        {/* Trending Categories */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-900">Explora por Temas</h2>
            <p className="text-secondary-500">Descubre lo que está pasando en el mundo</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedCategory === ''
                ? 'bg-secondary-900 text-white shadow-lg scale-105'
                : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
                }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-secondary-900">
              Últimas Noticias
            </h2>
            <div className="h-1 flex-grow mx-6 bg-secondary-200 rounded-full"></div>
            <a href="/news" className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center gap-1">
              Ver todo <span className="text-xl">→</span>
            </a>
          </div>

          <NewsList news={news} loading={loading} />
        </div>

        {/* Newsletter Section */}
        <div className="relative bg-secondary-900 rounded-3xl p-8 md:p-16 overflow-hidden text-center">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/50 to-transparent"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-sm text-3xl mb-2">
              📩
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              Suscríbete a nuestro boletín
            </h2>
            <p className="text-secondary-300 text-lg">
              Recibe las noticias más importantes directamente en tu bandeja de entrada. Sin spam, solo contenido de calidad.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 mt-8" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm transition-all"
              />
              <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-1">
                Suscribirse
              </button>
            </form>
            <p className="text-xs text-secondary-500 mt-4">
              Al suscribirte, aceptas nuestros términos y condiciones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
