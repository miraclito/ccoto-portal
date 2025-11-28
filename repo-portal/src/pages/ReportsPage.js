import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const ReportsPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await api.get('/reports/stats');
                setStats(statsRes.data);

                // Solo admin ve predicciones completas
                if (user.role === 'admin') {
                    const predRes = await api.get('/reports/prediction');
                    setPrediction(predRes.data);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.role]);

    if (loading) return <div className="p-8 text-center">Cargando reportes...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="container mx-auto px-4 py-8 mt-20">
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
                Reportes de Minería de Datos
            </h1>
            <p className="text-secondary-600 mb-8">
                Análisis estadístico y predicciones sobre el flujo de noticias.
            </p>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                    <h3 className="text-sm font-bold text-secondary-500 uppercase">Total Noticias</h3>
                    <p className="text-3xl font-bold text-primary-600">{stats?.totalNews}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                    <h3 className="text-sm font-bold text-secondary-500 uppercase">Fuentes Activas</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.totalSources}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Gráfico de Barras: Noticias por Categoría */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                    <h3 className="text-lg font-bold text-secondary-900 mb-4">Noticias por Categoría</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.newsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="categoryName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3B82F6" name="Cantidad" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Pastel: Distribución (Solo visual) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                    <h3 className="text-lg font-bold text-secondary-900 mb-4">Distribución porcentual</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.newsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {stats?.newsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sección de Predicciones (Solo Admin) */}
            {user.role === 'admin' && prediction && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-secondary-900">Predicción de Flujo de Noticias</h3>
                            <p className="text-sm text-secondary-500">
                                Regresión lineal basada en los últimos 60 días. Predicción para la próxima semana.
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-secondary-500 uppercase block">Tendencia</span>
                            <span className={`text-lg font-bold ${prediction.slope > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {prediction.slope > 0 ? '📈 Creciente' : '📉 Decreciente'}
                            </span>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={prediction.predictions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="predictedCount" stroke="#8884d8" strokeWidth={2} name="Predicción (Noticias/Día)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Nube de Palabras (Tendencias) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 mb-8">
                <h3 className="text-xl font-bold text-secondary-900 mb-6">Tendencias de Palabras (Word Cloud)</h3>
                <WordCloudSection />
            </div>
        </div>
    );
};

const WordCloudSection = () => {
    const [words, setWords] = useState([]);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const res = await api.get('/reports/wordcloud');
                setWords(res.data);
            } catch (error) {
                console.error('Error fetching word cloud:', error);
            }
        };
        fetchWords();
    }, []);

    if (words.length === 0) return <p className="text-center text-gray-500">Cargando tendencias...</p>;

    // Normalizar tamaños
    const maxVal = Math.max(...words.map(w => w.value));
    const minVal = Math.min(...words.map(w => w.value));

    const getSize = (value) => {
        const minSize = 12;
        const maxSize = 48;
        return minSize + ((value - minVal) / (maxVal - minVal)) * (maxSize - minSize);
    };

    return (
        <div className="flex flex-wrap justify-center gap-4 p-4">
            {words.map((word, index) => (
                <span
                    key={index}
                    style={{
                        fontSize: `${getSize(word.value)}px`,
                        opacity: 0.6 + (word.value / maxVal) * 0.4,
                    }}
                    className="font-bold text-primary-600 hover:text-primary-800 transition-colors cursor-default"
                    title={`${word.value} ocurrencias`}
                >
                    {word.text}
                </span>
            ))}
        </div>
    );
};

export default ReportsPage;
