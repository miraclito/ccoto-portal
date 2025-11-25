// src/components/news/NewsDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import newsService from '../../services/newsService';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch (error) {
      console.error('Error cargando noticia:', error);
      toast.error('Error al cargar la noticia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading />;

  if (!news) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-600">No se encontró la noticia.</p>
        <Link to="/news" className="text-primary-600 hover:underline">
          Volver a noticias
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/news"
        className="inline-block mb-4 text-primary-600 hover:underline"
      >
        ← Volver a noticias
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {news.title}
      </h1>

      <div className="text-sm text-gray-500 mb-4">
        <span>
          {news.category?.name ? news.category.name : 'Sin categoría'}
        </span>
        {' · '}
        <span>
          {news.publishedAt
            ? new Date(news.publishedAt).toLocaleString()
            : new Date(news.createdAt).toLocaleString()}
        </span>
        {news.type && (
          <>
            {' · '}
            <span>
              {news.type === 'scraped' ? 'Scrapeada' : 'Original'}
            </span>
          </>
        )}
      </div>

      {news.imageUrl && (
        <div className="mb-6">
          <img
            src={news.imageUrl.startsWith('http')
              ? news.imageUrl
              : `http://TU_IP_BACKEND:5000${news.imageUrl}`
            }
            alt={news.title}
            className="w-full rounded-lg shadow"
          />
        </div>
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </div>
  );
};

export default NewsDetail;
