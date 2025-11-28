import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Detectar scroll para efecto glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuOpen && !event.target.closest('.admin-dropdown-container')) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminMenuOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20'
        : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl">📰</span>
            </div>
            <span className={`text-2xl font-display font-bold tracking-tight ${scrolled ? 'text-secondary-900' : 'text-white'}`}>
              NewsPortal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors duration-200 ${isActive('/')
                ? 'text-primary-600'
                : scrolled ? 'text-secondary-600 hover:text-primary-600' : 'text-white/90 hover:text-white'
                }`}
            >
              Inicio
            </Link>
            <Link
              to="/news"
              className={`text-sm font-medium transition-colors duration-200 ${isActive('/news')
                ? 'text-primary-600'
                : scrolled ? 'text-secondary-600 hover:text-primary-600' : 'text-white/90 hover:text-white'
                }`}
            >
              Noticias
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200/20">
                {(isAdmin || user?.plan === 'premium') && (
                  <div className="relative admin-dropdown-container">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className={`text-sm font-medium flex items-center gap-1 ${scrolled ? 'text-secondary-600 hover:text-primary-600' : 'text-white/90 hover:text-white'}`}
                    >
                      {isAdmin ? 'Admin' : 'Menú'} ▾
                    </button>

                    {/* Dropdown Menu */}
                    {adminMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden animate-fade-in-down">
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                              onClick={() => setAdminMenuOpen(false)}
                            >
                              Dashboard
                            </Link>
                            <Link
                              to="/admin/news"
                              className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                              onClick={() => setAdminMenuOpen(false)}
                            >
                              Noticias
                            </Link>
                            <Link
                              to="/admin/categories"
                              className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                              onClick={() => setAdminMenuOpen(false)}
                            >
                              Categorías
                            </Link>
                            <Link
                              to="/admin/payments"
                              className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                              onClick={() => setAdminMenuOpen(false)}
                            >
                              Pagos
                            </Link>
                          </>
                        )}

                        {/* Links para Admin y Premium */}
                        <Link
                          to="/admin/sources"
                          className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          onClick={() => setAdminMenuOpen(false)}
                        >
                          Fuentes (Scrapers)
                        </Link>
                        <Link
                          to="/reports"
                          className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          onClick={() => setAdminMenuOpen(false)}
                        >
                          Reportes y Minería
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {/* Plan Badge */}
                  {user?.plan === 'premium' ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                      👑 Premium
                    </span>
                  ) : (
                    <Link
                      to="/subscribe"
                      className="px-3 py-1 bg-secondary-800 hover:bg-secondary-700 text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1"
                    >
                      💎 Hazte Premium
                    </Link>
                  )}

                  <span className={`text-sm font-medium ${scrolled ? 'text-secondary-900' : 'text-white'}`}>
                    Hola, {user?.fullName?.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium ${scrolled ? 'text-secondary-600 hover:text-primary-600' : 'text-white/90 hover:text-white'}`}
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="btn-primary shadow-lg shadow-primary-500/20"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
