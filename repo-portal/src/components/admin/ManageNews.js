import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import newsService from '../../services/newsService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { news: newsList } = await newsService.getAllNews({
      limit: 1000,
      isPublished: undefined,
      });

setNews(newsList || []);
    } catch (error) {
      toast.error('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

    try {
      await newsService.deleteNews(id);
      toast.success('Noticia eliminada exitosamente');
      fetchNews();
    } catch (error) {
      toast.error('Error al eliminar la noticia');
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'd MMM yyyy', { locale: es });
    } catch {
      return 'N/A';
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestionar Noticias</h1>
        <Link
          to="/admin/news/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
        >
          + Crear Noticia
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.type === 'original'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.type === 'original' ? 'Original' : 'Scrapeada'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.isPublished ? 'Publicada' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/news/${item.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver
                  </Link>
                  {item.type === 'original' && (
                    <Link
                      to={`/admin/news/edit/${item.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Editar
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageNews;
