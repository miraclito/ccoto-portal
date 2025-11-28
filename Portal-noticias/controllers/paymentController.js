const { Payment, User } = require('../models');
const path = require('path');
const fs = require('fs');

// Subir comprobante de pago
exports.uploadPayment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ninguna imagen'
            });
        }

        const proofUrl = `/uploads/payments/${req.file.filename}`;

        const payment = await Payment.create({
            userId: req.user.id,
            amount: 0.00, // El admin puede ajustar esto si es necesario, o se puede enviar desde el front
            proofUrl: proofUrl,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Comprobante subido exitosamente. Esperando aprobación.',
            data: payment
        });

    } catch (error) {
        console.error('Upload payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir comprobante',
            error: error.message
        });
    }
};

// Listar pagos (para admin)
exports.getPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        const payments = await Payment.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'fullName', 'email', 'plan']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener pagos',
            error: error.message
        });
    }
};

// Aprobar/Rechazar pago
exports.processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Debe ser approved o rejected'
            });
        }

        const payment = await Payment.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Este pago ya ha sido procesado'
            });
        }

        // Actualizar pago
        payment.status = status;
        payment.processedAt = new Date();
        payment.processedBy = req.user.id;

        if (status === 'rejected') {
            payment.rejectionReason = rejectionReason || 'Sin motivo especificado';
        }

        await payment.save();

        // Si se aprueba, actualizar usuario a Premium
        if (status === 'approved') {
            const user = payment.user;
            user.plan = 'premium';

            // Suscripción por 30 días (ejemplo)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            user.subscriptionExpiresAt = expiresAt;

            await user.save();
        }

        res.json({
            success: true,
            message: `Pago ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`,
            data: payment
        });

    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar pago',
            error: error.message
        });
    }
};

// Obtener mis pagos (usuario)
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get my payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mis pagos',
            error: error.message
        });
    }
};
