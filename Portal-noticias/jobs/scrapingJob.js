const cron = require('node-cron');
const ScraperManager = require('../scrapers/scraperManager');

class ScrapingJob {
  constructor() {
    this.manager = new ScraperManager();
    this.isRunning = false;
  }

  // Ejecutar scraping
  async run() {
    if (this.isRunning) {
      console.log('⚠️  Scraping ya está en ejecución, saltando...');
      return;
    }

    this.isRunning = true;
    console.log('\n⏰ CRON JOB: Iniciando scraping automático...');
    
    try {
      const result = await this.manager.runAll();
      console.log(`✅ CRON JOB: Completado - ${result.totalNews} noticias nuevas`);
    } catch (error) {
      console.error('❌ CRON JOB: Error en scraping automático:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Iniciar CRON job
  start() {
    const interval = process.env.SCRAPE_INTERVAL || 6; // horas
    
    // Ejecutar cada X horas
    // Formato: minuto hora * * *
    const cronExpression = `0 */${interval} * * *`; // Cada X horas
    
    console.log(`\n⏰ CRON Job configurado: cada ${interval} horas`);
    console.log(`📅 Expresión cron: ${cronExpression}\n`);

    // Iniciar cron
    this.job = cron.schedule(cronExpression, async () => {
      await this.run();
    }, {
      scheduled: true,
      timezone: "America/Lima" // Ajusta a tu zona horaria
    });

    console.log('✅ CRON Job iniciado correctamente\n');

    // Ejecutar inmediatamente al iniciar (opcional)
    if (process.env.SCRAPE_ON_START === 'true') {
      console.log('🚀 Ejecutando scraping inicial...\n');
      setTimeout(() => this.run(), 5000); // Esperar 5s después del inicio
    }
  }

  // Detener CRON job
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('⏹️  CRON Job detenido');
    }
  }
}

module.exports = ScrapingJob;
