import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PaymentRequests = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/payments?status=pending');
            setPayments(res.data.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleProcess = async (id, status) => {
        if (!window.confirm(`¿Estás seguro de ${status === 'approved' ? 'APROBAR' : 'RECHAZAR'} este pago?`)) return;

        setProcessingId(id);
        try {
            await api.put(`/payments/${id}/process`, { status });

            toast.success(`Pago ${status === 'approved' ? 'aprobado' : 'rechazado'} correctamente`);
            fetchPayments(); // Recargar lista
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Error al procesar el pago');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-secondary-500">Cargando solicitudes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-secondary-900">Solicitudes de Pago Pendientes</h2>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                    {payments.length} pendientes
                </span>
            </div>

            {payments.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-secondary-200">
                    <p className="text-secondary-500 text-lg">No hay solicitudes pendientes por el momento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {payments.map((payment) => (
                        <div key={payment.id} className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 flex flex-col md:flex-row gap-6">
                            {/* Imagen del comprobante */}
                            <div className="w-full md:w-1/3">
                                <a href={`http://localhost:5000${payment.proofUrl}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={`http://localhost:5000${payment.proofUrl}`}
                                        alt="Comprobante"
                                        className="w-full h-48 object-cover rounded-lg border border-secondary-100 hover:opacity-90 transition-opacity cursor-zoom-in"
                                    />
                                </a>
                                <p className="text-xs text-center text-secondary-400 mt-2">Clic para ver imagen completa</p>
                            </div>

                            {/* Detalles del usuario y acciones */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-secondary-900">{payment.user?.fullName}</h3>
                                            <p className="text-secondary-500 text-sm">@{payment.user?.username}</p>
                                            <p className="text-secondary-500 text-sm">{payment.user?.email}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                            Pendiente
                                        </span>
                                    </div>

                                    <div className="text-sm text-secondary-600 space-y-1">
                                        <p>📅 Fecha: {new Date(payment.createdAt).toLocaleString()}</p>
                                        <p>💰 Plan solicitado: Premium</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => handleProcess(payment.id, 'approved')}
                                        disabled={processingId === payment.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        ✅ Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleProcess(payment.id, 'rejected')}
                                        disabled={processingId === payment.id}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        ❌ Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentRequests;
