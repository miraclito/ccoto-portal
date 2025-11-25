const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sourceUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL original si es noticia scrapeada'
  },
  type: {
    type: DataTypes.ENUM('original', 'scraped'),
    defaultValue: 'original',
    comment: 'original = creada manual, scraped = obtenida por scraping'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'news',
  timestamps: true
});

module.exports = News;
