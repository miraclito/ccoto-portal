import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import scraperService from '../../services/scraperService';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, color, subtext }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-500 mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
          {value}
        </h3>
        {subtext && <p className="text-xs text-secondary-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, to, color }) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 hover:shadow-xl transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`}></div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-secondary-900 mb-2">{title}</h3>
      <p className="text-sm text-secondary-500">{description}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalCategories: 0,
    scrapedNews: 0,
    originalNews: 0,
  });

  const [scraping, setScraping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await scraperService.getStats();
      const data = response?.data || {};

      setStats({
        totalNews: data.totalNews ?? 0,
        totalCategories: data.totalCategories ?? 0,
        scrapedNews: data.totalScraped ?? 0,
        originalNews: data.totalOriginal ?? 0,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraping = async () => {
    try {
      setScraping(true);
      toast.info('Iniciando scraping... Esto puede tomar un momento...');
      const response = await scraperService.runScraping();
      const totalNew = response?.data?.totalNews ?? response?.data?.newsScraped ?? 0;
      toast.success(`Scraping completado: ${totalNew} noticias nuevas`);
      await fetchStats();
    } catch (error) {
      console.error('Error al ejecutar scraping:', error);
      toast.error('Error al ejecutar scraping');
    } finally {
      setScraping(false);
    }
  };

  const downloadCsv = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL;
      const url = `${baseUrl}/export/${type}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!res.ok) throw new Error('Error descargando CSV');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      toast.error('Error al descargar CSV');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-500">Bienvenido al panel de control de NewsPortal.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            className="p-2 text-secondary-400 hover:text-primary-600 transition-colors bg-white rounded-lg border border-secondary-200 shadow-sm"
            title="Actualizar datos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Noticias"
          value={stats.totalNews}
          icon="📰"
          color="bg-primary-600"
          subtext="Artículos publicados"
        />
        <StatCard
          title="Noticias Propias"
          value={stats.originalNews}
          icon="✍️"
          color="bg-green-500"
          subtext="Contenido original"
        />
        <StatCard
          title="Scrapeadas"
          value={stats.scrapedNews}
          icon="🕷️"
          color="bg-blue-500"
          subtext="De fuentes externas"
        />
        <StatCard
          title="Categorías"
          value={stats.totalCategories}
          icon="📂"
          color="bg-yellow-500"
          subtext="Secciones activas"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Crear Noticia"
            description="Redactar y publicar un nuevo artículo manualmente."
            icon="➕"
            to="/admin/news/create"
            color="bg-primary-600"
          />
          <ActionCard
            title="Gestionar Noticias"
            description="Editar, eliminar o despublicar noticias existentes."
            icon="📝"
            to="/admin/news"
            color="bg-indigo-600"
          />
          <ActionCard
            title="Categorías"
            description="Administrar las secciones y categorías del portal."
            icon="📂"
            to="/admin/categories"
            color="bg-violet-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Web Scraping Section */}
        <div className="bg-secondary-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🕷️</span>
              <h2 className="text-2xl font-bold">Web Scraping</h2>
            </div>
            <p className="text-secondary-300 mb-8 max-w-md">
              Ejecuta el motor de scraping para obtener las últimas noticias de fuentes externas automáticamente.
            </p>
            <button
              onClick={handleRunScraping}
              disabled={scraping}
              className="w-full sm:w-auto px-6 py-3 bg-white text-secondary-900 font-bold rounded-xl hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scraping ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-secondary-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Ejecutar Scraping Ahora'
              )}
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm">
          <h2 className="text-xl font-bold text-secondary-900 mb-6">Exportar Datos</h2>
          <div className="space-y-4">
            <button
              onClick={() => downloadCsv('news')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-secondary-200 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                  📊
                </div>
                <div className="text-left">
                  <p className="font-bold text-secondary-900">Noticias</p>
                  <p className="text-xs text-secondary-500">Formato CSV</p>
                </div>
              </div>
              <span className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Descargar ↓</span>
            </button>

            <button
              onClick={() => downloadCsv('stats')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-secondary-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                  📈
                </div>
                <div className="text-left">
                  <p className="font-bold text-secondary-900">Estadísticas</p>
                  <p className="text-xs text-secondary-500">Formato CSV</p>
                </div>
              </div>
              <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Descargar ↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
