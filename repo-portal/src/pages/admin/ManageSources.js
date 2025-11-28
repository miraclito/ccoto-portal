import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import sourceService from '../../services/sourceService';

import { useAuth } from '../../contexts/AuthContext';

const ManageSources = () => {
    const { user } = useAuth();
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            isActive: true,
            selectors: {
                articleSelector: 'article',
                titleSelector: 'h2',
                linkSelector: 'a',
                imageSelector: 'img',
                summarySelector: 'p'
            }
        }
    });

    const fetchSources = async () => {
        try {
            const res = await sourceService.getSources();
            setSources(res.data);
        } catch (error) {
            toast.error('Error al cargar fuentes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await sourceService.updateSource(editingId, data);
                toast.success('Fuente actualizada');
            } else {
                await sourceService.createSource(data);
                toast.success('Fuente creada');
            }
            reset();
            setEditingId(null);
            setTestResults(null);
            fetchSources();
        } catch (error) {
            toast.error('Error al guardar fuente');
        }
    };

    const handleEdit = (source) => {
        setEditingId(source.id);
        setValue('name', source.name);
        setValue('url', source.url);
        setValue('isActive', source.isActive);
        setValue('selectors', source.selectors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta fuente?')) return;
        try {
            await sourceService.deleteSource(id);
            toast.success('Fuente eliminada');
            fetchSources();
        } catch (error) {
            toast.error('Error al eliminar fuente');
        }
    };

    const handleTest = async () => {
        const data = watch();
        if (!data.url) {
            toast.warning('Ingresa una URL para probar');
            return;
        }

        setTesting(true);
        setTestResults(null);
        try {
            const res = await sourceService.testScraper({
                url: data.url,
                selectors: data.selectors
            });
            setTestResults(res.data);
            if (res.data.count > 0) {
                toast.success(`¡Éxito! Se encontraron ${res.data.count} noticias`);
            } else {
                toast.warning('No se encontraron noticias con estos selectores');
            }
        } catch (error) {
            toast.error('Error en la prueba: ' + (error.response?.data?.message || error.message));
        } finally {
            setTesting(false);
        }
    };

    const handleCancel = () => {
        reset();
        setEditingId(null);
        setTestResults(null);
    };

    const isPremium = user?.plan === 'premium';
    const sourceLimit = isPremium ? 3 : 1;
    // Admin no tiene límite, pero para efectos de UI mostramos el límite del plan
    const canAddSource = user?.role === 'admin' || sources.length < sourceLimit || editingId;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-secondary-900">
                    Gestión de Fuentes de Noticias
                </h1>
                {isPremium && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">
                        Fuentes: {sources.length} / {sourceLimit}
                    </div>
                )}
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-6">
                    {editingId ? 'Editar Fuente' : 'Agregar Nueva Fuente'}
                </h2>

                {!canAddSource && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-yellow-700">
                            Has alcanzado el límite de {sourceLimit} fuentes para tu plan {isPremium ? 'Premium' : 'Gratuito'}.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${!canAddSource ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre del Medio</label>
                            <input
                                {...register('name', { required: true })}
                                className="w-full px-4 py-2 rounded-lg border border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Ej: Diario El Peruano"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">URL Principal</label>
                            <input
                                {...register('url', { required: true })}
                                className="w-full px-4 py-2 rounded-lg border border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="https://elperuano.pe/noticias"
                            />
                        </div>
                    </div>

                    <div className="border-t border-secondary-100 pt-6">
                        <h3 className="text-lg font-bold text-secondary-900 mb-4">Selectores CSS</h3>
                        <p className="text-sm text-secondary-500 mb-4">
                            Define cómo encontrar los elementos en la página. Usa selectores tipo jQuery/CSS.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-secondary-600 mb-1">Contenedor de Artículo</label>
                                <input
                                    {...register('selectors.articleSelector', { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300"
                                    placeholder="article, .news-card"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-600 mb-1">Título</label>
                                <input
                                    {...register('selectors.titleSelector', { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300"
                                    placeholder="h2, .title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-600 mb-1">Enlace</label>
                                <input
                                    {...register('selectors.linkSelector', { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300"
                                    placeholder="a"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-600 mb-1">Imagen</label>
                                <input
                                    {...register('selectors.imageSelector')}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300"
                                    placeholder="img"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-600 mb-1">Resumen (Opcional)</label>
                                <input
                                    {...register('selectors.summarySelector')}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300"
                                    placeholder="p.summary"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('isActive')}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-secondary-700">Fuente Activa</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Resultados de prueba */}
                    {testResults && (
                        <div className={`p-4 rounded-lg border ${testResults.count > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <h4 className="font-bold mb-2">Resultados de la prueba:</h4>
                            <p className="text-sm mb-2">Se encontraron {testResults.count} noticias.</p>
                            {testResults.results.length > 0 && (
                                <ul className="space-y-2 text-xs">
                                    {testResults.results.map((item, i) => (
                                        <li key={i} className="flex gap-2">
                                            {item.imageUrl && <img src={item.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />}
                                            <div>
                                                <p className="font-bold">{item.title}</p>
                                                <p className="text-secondary-500 truncate w-64">{item.sourceUrl}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={testing}
                            className="px-6 py-2 bg-secondary-800 text-white rounded-lg font-bold hover:bg-secondary-700 transition-colors disabled:opacity-50"
                        >
                            {testing ? 'Probando...' : '🧪 Probar Selectores'}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-colors"
                        >
                            {editingId ? 'Actualizar Fuente' : 'Guardar Fuente'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-white text-secondary-700 border border-secondary-300 rounded-lg font-bold hover:bg-secondary-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Fuentes */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary-50 border-b border-secondary-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-secondary-900">Nombre</th>
                                <th className="px-6 py-4 font-bold text-secondary-900">URL</th>
                                <th className="px-6 py-4 font-bold text-secondary-900">Estado</th>
                                <th className="px-6 py-4 font-bold text-secondary-900 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-secondary-500">Cargando fuentes...</td>
                                </tr>
                            ) : sources.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-secondary-500">No hay fuentes configuradas.</td>
                                </tr>
                            ) : (
                                sources.map((source) => (
                                    <tr key={source.id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-secondary-900">{source.name}</td>
                                        <td className="px-6 py-4 text-secondary-600 text-sm truncate max-w-xs">
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                                                {source.url}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${source.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {source.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(source)}
                                                className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(source.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageSources;
