import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewsCard = ({ news }) => {
  const navigate = useNavigate();

  const {
    id,
    slug,
    title,
    summary,
    imageUrl,
    sourceUrl,
    category,
    publishedAt,
    createdAt,
    type,
    author
  } = news;

  const [imgError, setImgError] = React.useState(false);

  const displayTitle = title || 'Sin título';
  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop';
  const displayImage = (imgError || !imageUrl) ? fallbackImage : imageUrl;

  // Extraer nombre de la fuente
  let displaySource = 'Original';
  if (sourceUrl) {
    try {
      const hostname = new URL(sourceUrl).hostname;
      displaySource = hostname.replace(/^www\./, '').split('.')[0];
      displaySource = displaySource.charAt(0).toUpperCase() + displaySource.slice(1);
    } catch {
      displaySource = 'Externa';
    }
  } else if (author) {
    displaySource = author.fullName;
  }

  const displayCategory = category?.name || 'General';
  const displayDate = new Date(publishedAt || createdAt).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  });

  const handleClick = () => {
    if (id) navigate(`/news/${id}`);
    else if (slug) navigate(`/news/slug/${slug}`);
    else if (sourceUrl) window.open(sourceUrl, '_blank');
  };

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-secondary-100 flex flex-col h-full"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-secondary-200">
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 text-xs font-bold text-white bg-primary-600/90 backdrop-blur-sm rounded-full shadow-sm">
            {displayCategory}
          </span>
          {type === 'scraped' && (
            <span className="px-3 py-1 text-xs font-bold text-white bg-secondary-800/90 backdrop-blur-sm rounded-full shadow-sm">
              {displaySource}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3 text-xs text-secondary-500 font-medium">
          <span className="flex items-center gap-1">
            📅 {displayDate}
          </span>
          {type === 'original' && (
            <>
              <span>•</span>
              <span className="text-primary-600">Redacción Propia</span>
            </>
          )}
        </div>

        <h3 className="text-lg font-display font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {displayTitle}
        </h3>

        <p className="text-sm text-secondary-500 line-clamp-3 mb-4 flex-grow">
          {summary || 'Haz clic para leer la noticia completa.'}
        </p>

        <div className="pt-4 border-t border-secondary-100 flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Leer más
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
