import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Por favor selecciona una imagen del comprobante');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await api.post('/payments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('¡Comprobante enviado! Tu solicitud está siendo procesada.');
            navigate('/profile'); // O a donde quieras redirigir
        } catch (error) {
            console.error('Error uploading payment:', error);
            toast.error(error.response?.data?.message || 'Error al subir el comprobante');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-secondary-900 mb-4">
                        Mejora tu Experiencia con Premium
                    </h1>
                    <p className="text-xl text-secondary-600">
                        Accede a contenido exclusivo y apoya al periodismo independiente.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Plan Info & QR */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-secondary-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-secondary-900">Plan Premium</h2>
                            <span className="px-4 py-1 bg-primary-100 text-primary-700 font-bold rounded-full text-sm">
                                S/ 10.00 / mes
                            </span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {['Acceso ilimitado a todas las noticias', 'Sin publicidad', 'Soporte prioritario', 'Insignia de miembro destacado'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-secondary-600">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="bg-secondary-50 rounded-2xl p-6 text-center border border-dashed border-secondary-300">
                            <p className="font-bold text-secondary-900 mb-4">Escanea para pagar con Yape</p>
                            {/* Placeholder QR - Reemplazar con imagen real */}
                            <div className="w-48 h-48 bg-white mx-auto mb-4 rounded-xl flex items-center justify-center shadow-sm">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                                    alt="QR Yape"
                                    className="w-40 h-40"
                                />
                            </div>
                            <p className="text-sm text-secondary-500">
                                A nombre de: <strong>Hiram Company SAC</strong><br />
                                Número: <strong>999-999-999</strong>
                            </p>
                        </div>
                    </div>

                    {/* Upload Form */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-secondary-100">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Confirmar Pago</h2>
                        <p className="text-secondary-600 mb-6">
                            Sube una captura de pantalla de tu pago exitoso en Yape. Nuestro equipo lo validará en breve.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-2 border-dashed border-secondary-300 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                        <p className="mt-2 text-sm text-primary-600 font-medium">Clic para cambiar imagen</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <svg className="w-12 h-12 mx-auto text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-secondary-600 font-medium">Arrastra tu captura aquí o haz clic</p>
                                        <p className="text-xs text-secondary-400">JPG, PNG (Max 5MB)</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 ${loading || !file
                                    ? 'bg-secondary-300 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/30'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar Comprobante'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
