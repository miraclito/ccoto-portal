const { News, Category, Source, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas generales
exports.getStats = async (req, res) => {
  try {
    // 1. Noticias por Categoría
    const newsByCategory = await News.findAll({
      attributes: [
        [sequelize.col('category.name'), 'categoryName'],
        [sequelize.fn('COUNT', sequelize.col('News.id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category', // Alias requerido
        attributes: []
      }],
      group: ['category.name']
    });

    // 2. Noticias por Día (Últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newsByDay = await News.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('publishedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        publishedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('publishedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('publishedAt')), 'ASC']]
    });

    // 3. Total de Fuentes
    const totalSources = await Source.count();
    const totalNews = await News.count();

    res.json({
      newsByCategory,
      newsByDay,
      totalSources,
      totalNews
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Análisis de Palabras (Word Cloud)
exports.getWordCloud = async (req, res) => {
  try {
    // Obtener las últimas 200 noticias
    const news = await News.findAll({
      attributes: ['title'],
      limit: 200,
      order: [['publishedAt', 'DESC']]
    });

    const text = news.map(n => n.title).join(' ').toLowerCase();

    // Lista básica de stopwords en español
    const stopwords = new Set([
      'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'es', 'son', 'fue', 'era', 'ser', 'estar'
    ]);

    const words = text.match(/\b[a-záéíóúñ]+\b/g) || [];
    const frequency = {};

    words.forEach(word => {
      if (!stopwords.has(word) && word.length > 3) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Convertir a array y ordenar
    const wordCloud = Object.entries(frequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Top 50

    res.json(wordCloud);

  } catch (error) {
    console.error('Error getting word cloud:', error);
    res.status(500).json({ message: error.message });
  }
};

// Predicción simple (Regresión Lineal)
exports.getPrediction = async (req, res) => {
  try {
    // Obtener datos históricos (últimos 60 días para mejor precisión)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const history = await News.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('publishedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        publishedAt: {
          [Op.gte]: sixtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('publishedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('publishedAt')), 'ASC']]
    });

    // Preparar datos para regresión (x = día 1, 2, 3..., y = cantidad)
    const dataPoints = history.map((item, index) => ({
      x: index + 1,
      y: parseInt(item.dataValues.count, 10)
    }));

    if (dataPoints.length < 2) {
      return res.json({ prediction: [], message: 'Insuficientes datos para predecir' });
    }

    // Calcular Regresión Lineal Simple: y = mx + b
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumXX = dataPoints.reduce((acc, p) => acc + (p.x * p.x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predecir próximos 7 días
    const predictions = [];
    const lastDate = new Date(history[history.length - 1].dataValues.date);

    for (let i = 1; i <= 7; i++) {
      const nextX = n + i;
      const predictedY = Math.max(0, Math.round(slope * nextX + intercept)); // No negativos

      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i);

      predictions.push({
        date: nextDate.toISOString().split('T')[0],
        predictedCount: predictedY
      });
    }

    res.json({
      slope,
      intercept,
      predictions
    });

  } catch (error) {
    console.error('Error calculating prediction:', error);
    res.status(500).json({ message: error.message });
  }
};
