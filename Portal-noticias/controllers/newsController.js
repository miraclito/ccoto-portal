const { News, Category, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Crear slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .substring(0, 200);
};

// Obtener todas las noticias (con paginación y filtros)
exports.getAllNews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      type,
      search,
      isPublished = true
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        news: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
};

// Obtener noticia por ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Incrementar vistas
    await news.increment('views');

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
};

// Crear noticia
exports.createNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      categoryId,
      isPublished,
      publishedAt
    } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
      });
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const slug = createSlug(title);
    let imageUrl = null;

    // Si hay imagen subida
    if (req.file) {
      imageUrl = `/uploads/news/${req.file.filename}`;
    }

    const news = await News.create({
      title,
      slug,
      summary,
      content,
      imageUrl,
      categoryId,
      authorId: req.user.id,
      type: 'original',
      isPublished: isPublished || false,
      publishedAt: isPublished ? (publishedAt || new Date()) : null
    });

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating news',
      error: error.message
    });
  }
};

// Actualizar noticia
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content,
      categoryId,
      isPublished,
      publishedAt
    } = req.body;

    const news = await News.findByPk(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const updateData = {};

    if (title) {
      updateData.title = title;
      updateData.slug = createSlug(title);
    }
    if (summary !== undefined) updateData.summary = summary;
    if (content) updateData.content = content;
    if (categoryId) updateData.categoryId = categoryId;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !news.publishedAt) {
        updateData.publishedAt = publishedAt || new Date();
      }
    }

    // Si hay nueva imagen
    if (req.file) {
      // Eliminar imagen anterior si existe y no es URL externa
      if (news.imageUrl && !news.imageUrl.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '..', news.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/news/${req.file.filename}`;
    }

    await news.update(updateData);

    res.json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating news',
      error: error.message
    });
  }
};

// Eliminar noticia
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Eliminar imagen si existe y no es URL externa
    if (news.imageUrl && !news.imageUrl.startsWith('http')) {
      const imagePath = path.join(__dirname, '..', news.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await news.destroy();

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting news',
      error: error.message
    });
  }
};
