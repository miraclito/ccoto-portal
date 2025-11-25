// src/components/news/NewsList.js
import React from 'react';
import NewsCard from './NewsCard';

const NewsList = ({ news, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-xl bg-white shadow-sm overflow-hidden border border-gray-200"
          >
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center mt-8">
        No se encontraron noticias con los filtros seleccionados.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => (
        <NewsCard key={item.id || item._id || item.slug} news={item} />
      ))}
    </div>
  );
};

export default NewsList;
