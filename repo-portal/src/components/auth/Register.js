import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('¡Registro exitoso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
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
              Únete a nuestra comunidad.
            </h1>
            <p className="text-lg text-secondary-200 leading-relaxed">
              Crea tu cuenta hoy y personaliza tu experiencia de noticias. Guarda tus artículos favoritos y recibe alertas personalizadas.
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
              Crear Cuenta
            </h2>
            <p className="mt-2 text-sm text-secondary-500">
              Completa el formulario para comenzar.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
                Nombre Completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                Nombre de Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                  placeholder="Ej: juanperez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  Confirmar
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 hover:bg-white"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
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
                    Registrando...
                  </span>
                ) : 'Crear Cuenta'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">
                    ¿Ya tienes una cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
