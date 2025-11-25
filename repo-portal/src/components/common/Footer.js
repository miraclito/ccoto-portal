import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">📰 NewsPortal</h3>
            <p className="text-gray-400">
              Tu fuente confiable de noticias actualizadas sobre tecnología,
              deportes, política y más.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/news" className="text-gray-400 hover:text-white">
                  Noticias
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white">
                  Acerca de
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Información</h3>
            <p className="text-gray-400">
              © {new Date().getFullYear()} NewsPortal
              <br />
              Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
