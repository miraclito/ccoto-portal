const { News, Category, User } = require('../models');
const { Parser } = require('json2csv');
const { Op } = require('sequelize');
// Exportar noticias a CSV
exports.exportNewsToCSV = async (req, res) => {
  try {
    const {
      categoryId,
      type,
      isPublished,
      startDate,
      endDate
    } = req.query;

    // Construir filtros
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Obtener noticias
    const news = await News.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: User,
          as: 'author',
          attributes: ['fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay noticias para exportar'
      });
    }

    // Formatear datos para CSV
    const csvData = news.map(item => ({
      ID: item.id,
      Título: item.title,
      Slug: item.slug,
      Resumen: item.summary,
      Contenido: item.content,
      Categoría: item.category ? item.category.name : 'Sin categoría',
      Tipo: item.type === 'original' ? 'Original' : 'Scrapeada',
      Autor: item.author ? item.author.fullName : 'Sistema',
      'Email Autor': item.author ? item.author.email : '',
      'URL Fuente': item.sourceUrl || '',
      'URL Imagen': item.imageUrl || '',
      Publicada: item.isPublished ? 'Sí' : 'No',
      'Fecha Publicación': item.publishedAt ? item.publishedAt.toISOString() : '',
      Vistas: item.views,
      'Fecha Creación': item.createdAt.toISOString(),
      'Última Actualización': item.updatedAt.toISOString()
    }));

    // Definir campos del CSV
    const fields = [
      'ID',
      'Título',
      'Slug',
      'Resumen',
      'Contenido',
      'Categoría',
      'Tipo',
      'Autor',
      'Email Autor',
      'URL Fuente',
      'URL Imagen',
      'Publicada',
      'Fecha Publicación',
      'Vistas',
      'Fecha Creación',
      'Última Actualización'
    ];

    // Crear parser
    const json2csvParser = new Parser({ fields, delimiter: ',', withBOM: true });
    const csv = json2csvParser.parse(csvData);

    // Configurar headers para descarga
    const filename = `noticias_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);

  } catch (error) {
    console.error('❌ Error exportando CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando noticias a CSV',
      error: error.message
    });
  }
};

// Exportar categorías a CSV
exports.exportCategoriesToCSV = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay categorías para exportar'
      });
    }

    const csvData = categories.map(cat => ({
      ID: cat.id,
      Nombre: cat.name,
      Slug: cat.slug,
      Descripción: cat.description || '',
      Activa: cat.isActive ? 'Sí' : 'No',
      'Fecha Creación': cat.createdAt.toISOString(),
      'Última Actualización': cat.updatedAt.toISOString()
    }));

    const fields = ['ID', 'Nombre', 'Slug', 'Descripción', 'Activa', 'Fecha Creación', 'Última Actualización'];
    const json2csvParser = new Parser({ fields, delimiter: ',', withBOM: true });
    const csv = json2csvParser.parse(csvData);

    const filename = `categorias_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);

  } catch (error) {
    console.error('❌ Error exportando categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando categorías a CSV',
      error: error.message
    });
  }
};

// Exportar estadísticas a CSV
exports.exportStatsToCSV = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');

    // Obtener estadísticas por categoría
    const stats = await News.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('News.id')), 'totalNoticias'],
        [sequelize.fn('SUM', sequelize.col('views')), 'totalVistas'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'original' THEN 1 END")), 'noticiasOriginales'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'scraped' THEN 1 END")), 'noticiasScraped']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      group: ['categoryId', 'category.id', 'category.name']
    });

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay estadísticas para exportar'
      });
    }

    const csvData = stats.map(stat => ({
      Categoría: stat.category ? stat.category.name : 'Sin categoría',
      'Total Noticias': stat.dataValues.totalNoticias,
      'Total Vistas': stat.dataValues.totalVistas || 0,
      'Noticias Originales': stat.dataValues.noticiasOriginales,
      'Noticias Scrapeadas': stat.dataValues.noticiasScraped
    }));

    const fields = ['Categoría', 'Total Noticias', 'Total Vistas', 'Noticias Originales', 'Noticias Scrapeadas'];
    const json2csvParser = new Parser({ fields, delimiter: ',', withBOM: true });
    const csv = json2csvParser.parse(csvData);

    const filename = `estadisticas_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);

  } catch (error) {
    console.error('❌ Error exportando estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando estadísticas a CSV',
      error: error.message
    });
  }
};
