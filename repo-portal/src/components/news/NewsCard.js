// src/components/news/NewsCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewsCard = ({ news }) => {
  const navigate = useNavigate();

  const {
    id,
    slug,
    title,
    summary,
    content,
    imageUrl,
    sourceUrl,
    category,
    publishedAt,
    createdAt,
    views,
    type,
  } = news;

  const displayTitle = title || 'Sin título';
  const displayDescription = summary || (content ? content.slice(0, 200) + '...' : '');
  const displayImage = imageUrl || '/logo192.png';

  let displaySource = 'Original';
  if (sourceUrl) {
    try {
      const hostname = new URL(sourceUrl).hostname;
      displaySource = hostname.replace(/^www\./, '');
    } catch {
      displaySource = 'Fuente externa';
    }
  }

  const displayCategory = category?.name || '';
  const displayDate =
    publishedAt || createdAt
      ? new Date(publishedAt || createdAt).toLocaleString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  const handleClick = () => {
    // Si tienes ruta de detalle tipo /news/:id
    if (id) {
      navigate(`/news/${id}`);
    } else if (slug) {
      navigate(`/news/slug/${slug}`);
    } else if (sourceUrl) {
      window.open(sourceUrl, '_blank');
    }
  };

  return (
    <article
      className="flex flex-col rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 overflow-hidden cursor-pointer transition transform hover:-translate-y-0.5"
      onClick={handleClick}
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={displayTitle}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {displayCategory && (
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/70 text-white">
            {displayCategory}
          </span>
        )}
        {type === 'scraped' && (
          <span className="absolute bottom-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
            Scraping
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {displayTitle}
        </h2>

        {displayDescription && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-3">
            {displayDescription}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
          <span className="font-medium">{displaySource}</span>
          <div className="flex flex-col items-end">
            {displayDate && <span>{displayDate}</span>}
            {typeof views === 'number' && (
              <span className="mt-1 text-[10px]">
                {views} vistas
              </span>
            )}
          </div>
        </div>

        {sourceUrl && (
          <div className="mt-3">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver noticia original
            </a>
          </div>
        )}
      </div>
    </article>
  );
};

export default NewsCard;
