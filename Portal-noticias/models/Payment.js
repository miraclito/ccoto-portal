const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'PEN'
    },
    proofUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'URL de la captura de pantalla del pago (Yape)'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    processedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del admin que procesó el pago'
    },
    rejectionReason: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true
});

module.exports = Payment;
