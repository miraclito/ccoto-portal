import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Sesión cerrada');
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
    };

    const menuItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard' },
        { path: '/admin/news', icon: '📝', label: 'Noticias' },
        { path: '/admin/news/create', icon: '➕', label: 'Crear Noticia' },
        { path: '/admin/categories', icon: '📂', label: 'Categorías' },
        { path: '/admin/payments', icon: '💰', label: 'Solicitudes Pago' },
    ];

    return (
        <div className="min-h-screen bg-secondary-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary-900 text-white fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6 border-b border-secondary-800">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-primary-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                            <span className="text-xl">📰</span>
                        </div>
                        <span className="text-xl font-display font-bold">NewsPortal</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-4">
                        Menu Principal
                    </p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-secondary-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                            <p className="text-xs text-secondary-500 truncate">Administrador</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-secondary-700 text-secondary-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden bg-secondary-900 text-white p-4 flex justify-between items-center sticky top-0 z-30">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl">📰</span>
                        <span className="font-bold">NewsPortal Admin</span>
                    </Link>
                    <button className="p-2 text-secondary-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
