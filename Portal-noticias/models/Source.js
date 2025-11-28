const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Source = sequelize.define('Source', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    selectors: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON storing selectors: articleSelector, titleSelector, linkSelector, imageSelector, summarySelector'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastScrapedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'sources'
});

module.exports = Source;
