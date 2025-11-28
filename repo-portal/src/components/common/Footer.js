import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">📰</span>
              <span className="text-2xl font-display font-bold">NewsPortal</span>
            </div>
            <p className="text-secondary-400 leading-relaxed max-w-md">
              Tu fuente confiable de noticias actualizadas al instante.
              Utilizamos tecnología avanzada de scraping para traerte lo último
              de los medios más importantes del país.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display">Explorar</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Últimas Noticias
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display">Legal</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-500 text-sm">
            © {new Date().getFullYear()} NewsPortal. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-secondary-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center">
              <span className="text-xs">FB</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center">
              <span className="text-xs">TW</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center">
              <span className="text-xs">IG</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
