import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/50 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/30">
              <span className="text-2xl">📰</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">NewsPortal</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-display font-bold leading-tight">
              Mantente informado con la verdad.
            </h1>
            <p className="text-lg text-secondary-200 leading-relaxed">
              Accede a las noticias más relevantes del momento, curadas automáticamente de las fuentes más confiables.
            </p>
          </div>

          <div className="text-sm text-secondary-400">
            © {new Date().getFullYear()} NewsPortal. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-secondary-900">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-secondary-500">
              Por favor ingresa tus credenciales para continuar.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  Correo Electrónico
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-600">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar Sesión'}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">
                    ¿No tienes una cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Regístrate gratis aquí
                </Link>
              </div>
            </div>
          </form>

          {/* Credenciales de prueba (Estilizadas) */}
          <div className="mt-8 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔑</span>
              <div>
                <p className="text-xs font-bold text-secondary-700 uppercase tracking-wide mb-1">
                  Acceso Demo
                </p>
                <div className="text-sm text-secondary-600 space-y-0.5 font-mono">
                  <p>User: admin@newsportal.com</p>
                  <p>Pass: Admin123!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
