// controllers/reportController.js
const { News, Category } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// GET /api/reports/overview
exports.getOverviewStats = async (req, res) => {
  try {
    const [
      totalNews,
      totalOriginal,
      totalScraped,
      totalPublished,
      totalDraft,
      totalViews,
      totalCategories
    ] = await Promise.all([
      News.count(),
      News.count({ where: { type: 'original' } }),
      News.count({ where: { type: 'scraped' } }),
      News.count({ where: { isPublished: true } }),
      News.count({ where: { isPublished: false } }),
      News.sum('views'),
      Category.count(),
    ]);

    // Serie de tiempo últimos 30 días (total de noticias por día)
    const since = new Date();
    since.setDate(since.getDate() - 29); // últimos 30 días

    const perDay = await News.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: since },
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalNews,
        totalOriginal,
        totalScraped,
        totalPublished,
        totalDraft,
        totalViews: totalViews || 0,
        totalCategories,
        perDay: perDay.map(row => ({
          date: row.date,
          count: Number(row.count || 0),
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error en getOverviewStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas generales',
      error: error.message,
    });
  }
};

// GET /api/reports/by-category
exports.getNewsByCategory = async (req, res) => {
  try {
    const rows = await News.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('News.id')), 'totalNews'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal("CASE WHEN type = 'original' THEN 1 ELSE 0 END")
          ),
          'originalNews',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal("CASE WHEN type = 'scraped' THEN 1 ELSE 0 END")
          ),
          'scrapedNews',
        ],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      raw: true,
    });

    const data = rows.map(row => ({
      categoryId: row.categoryId,
      categoryName: row['category.name'] || 'Sin categoría',
      totalNews: Number(row.totalNews || 0),
      originalNews: Number(row.originalNews || 0),
      scrapedNews: Number(row.scrapedNews || 0),
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Error en getNewsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo noticias por categoría',
      error: error.message,
    });
  }
};

// GET /api/reports/time-series
exports.getNewsTimeSeries = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - (Number(days) - 1));

    const rows = await News.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalNews'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal("CASE WHEN type = 'original' THEN 1 ELSE 0 END")
          ),
          'originalNews',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal("CASE WHEN type = 'scraped' THEN 1 ELSE 0 END")
          ),
          'scrapedNews',
        ],
      ],
      where: {
        createdAt: { [Op.gte]: since },
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    const data = rows.map(row => ({
      date: row.date,
      totalNews: Number(row.totalNews || 0),
      originalNews: Number(row.originalNews || 0),
      scrapedNews: Number(row.scrapedNews || 0),
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Error en getNewsTimeSeries:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo serie de tiempo de noticias',
      error: error.message,
    });
  }
};
