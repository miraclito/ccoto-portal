const ScraperManager = require('../scrapers/scraperManager');

// Ejecutar scraping manual de todos los sitios
exports.runAllScrapers = async (req, res) => {
  try {
    console.log('📡 API: Iniciando scraping manual completo...');
    
    const manager = new ScraperManager();
    const result = await manager.runAll();

    res.json({
      success: true,
      message: `Scraping completado: ${result.totalNews} noticias nuevas`,
      data: {
        totalNews: result.totalNews,
        results: result.results
      }
    });
  } catch (error) {
    console.error('❌ Error en scraping manual:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando scraping',
      error: error.message
    });
  }
};
// Ejecutar scraper específico
exports.runSpecificScraper = async (req, res) => {
  try {
    const { scraperName } = req.params;
    
    console.log(`📡 API: Ejecutando scraper: ${scraperName}`);
    
    const manager = new ScraperManager();
    const result = await manager.runSpecific(scraperName);

    if (result.totalNews === 0 && result.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Scraper "${scraperName}" no encontrado`
      });
    }

    res.json({
      success: true,
      message: `Scraper ${scraperName} completado`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error en scraper específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando scraper',
      error: error.message
    });
  }
};
// Obtener estadísticas de scraping
// Obtener estadísticas de scraping
exports.getStats = async (req, res) => {
  try {
    const { News, Category } = require('../models');
    const { sequelize } = require('../config/database');
    const { Op } = require('sequelize');

    // Total de noticias
    const totalNews = await News.count();
    const totalOriginal = await News.count({ where: { type: 'original' } });
    const totalScraped = await News.count({ where: { type: 'scraped' } });
    const totalPublished = await News.count({ where: { isPublished: true } });
    const totalDraft = await News.count({ where: { isPublished: false } });

    // Total de vistas
    const totalViews = await News.sum('views') || 0;

    // Noticias recientes scrapeadas (últimas 24h)
    const recentScraped = await News.count({
      where: {
        type: 'scraped',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Noticias por categoría
    const byCategory = await News.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('News.id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      group: ['categoryId', 'category.id', 'category.name'],
      raw: true
    });

    // Total de categorías
    const totalCategories = await Category.count();

    // Formatear respuesta
    const stats = {
      totalNews,
      totalOriginal,
      totalScraped,
      totalPublished,
      totalDraft,
      totalViews,
      totalCategories,
      recentScraped,
      byCategory: byCategory.map(item => ({
        category: item['category.name'] || 'Sin categoría',
        count: parseInt(item.count)
      })),
      scrapers: {
        available: 5,
        list: [
          'BBC News',
          'The Verge',
          'TechCrunch',
          'Wired',
          'Ars Technica'
        ]
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};
// Listar scrapers disponibles
exports.listScrapers = async (req, res) => {
  try {
    const scrapers = [
      'BBC News',
      'The Verge',
      'TechCrunch',
      'Wired',
      'Ars Technica'
    ];

    res.json({
      success: true,
      data: {
        scrapers,
        total: scrapers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listando scrapers',
      error: error.message
    });
  }
};
