require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const { User, Category, News } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rutas
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const newsRoutes = require('./routes/news');
const scraperRoutes = require('./routes/scrapers');
const exportRoutes = require('./routes/export');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');
const sourceRoutes = require('./routes/sources');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/scrapers', scraperRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sources', sourceRoutes);
// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 News Portal API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      categories: '/api/categories',
      news: '/api/news',
      scrapers: '/api/scrapers',
      export: '/api/export'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Inicializar CRON Job de scraping
const ScrapingJob = require('./jobs/scrapingJob');
let scrapingJob;

// Inicializar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos
    // await sequelize.sync({ alter: true });
    console.log('✅ Base de datos conectada (sincronización manual)');

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);

      // Iniciar CRON job si está habilitado
      if (process.env.SCRAPE_ENABLED === 'true') {
        scrapingJob = new ScrapingJob();
        scrapingJob.start();
      } else {
        console.log('⏸️  CRON Job de scraping deshabilitado\n');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
