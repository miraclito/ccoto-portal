// scrapers/scraperManager.js - VERSIÓN MASIVA
const { Category } = require('../models');
const RPPScraper = require('./sites/rppScraper');
const ElComercioScraper = require('./sites/elComercioScraper');
const LaRepublicaScraper = require('./sites/laRepublicaScraper');
const GestionScraper = require('./sites/gestion21Scraper');
const Peru21Scraper = require('./sites/peru21Scraper');
const CorreoScraper = require('./sites/correoScraper');
const OjoScraper = require('./sites/ojoScraper');
const ExpresoScraper = require('./sites/expresoScraper');
const LaRazonScraper = require('./sites/larazonScraper');
const TromeScraper = require('./sites/tromeScraper');
const DeporScraper = require('./sites/deporScraper');
const AmericaScraper = require('./sites/americaScraper');
class ScraperManager {
  constructor() {
    this.scrapers = [];
  }

  async initializeScrapers() {
    try {
      console.log('🔧 Inicializando categoría...');
      let category = await Category.findOne({ where: { name: 'Nacionales' } });
      if (!category) {
        category = await Category.create({
          name: 'Nacionales',
          slug: 'nacionales',
          description: 'Noticias de medios peruanos',
        });
      }
      console.log(`✅ Categoría ID: ${category.id}`);

      // SOLO los scrapers que funcionan bien (sin Reddit por ahora)
      this.scrapers = [
        new RPPScraper(category.id),
        new ElComercioScraper(category.id),
        new LaRepublicaScraper(category.id),
        new GestionScraper(category.id),
        new Peru21Scraper(category.id),
        new CorreoScraper(category.id),
        new OjoScraper(category.id),
        new ExpresoScraper(category.id),      // NUEVO
        new LaRazonScraper(category.id),      // NUEVO
        new TromeScraper(category.id),        // NUEVO
        new DeporScraper(category.id),        // NUEVO
        new AmericaScraper(category.id)       // NUEVO
      ];

      console.log(`✅ ${this.scrapers.length} scrapers peruanos inicializados`);
    } catch (error) {
      console.error('❌ Error inicializando scrapers:', error.message);
    }
  }

  // 🎯 NUEVO MÉTODO: SCRAPING MASIVO AUTOMÁTICO
  async runMassiveScraping(targetCount = 1000) {
    console.log('\n🚀 ===== INICIANDO SCRAPING MASIVO =====');
    console.log(`🎯 Objetivo: ${targetCount}+ noticias\n`);

    await this.initializeScrapers();

    let totalNews = 0;
    let cycle = 1;
    const maxCycles = 10; // Máximo de ciclos para evitar loop infinito
    const allResults = [];

    while (totalNews < targetCount && cycle <= maxCycles) {
      console.log(`\n🔄 === CICLO ${cycle} ===`);
      console.log(`📈 Progreso: ${totalNews}/${targetCount} noticias\n`);

      let cycleNews = 0;
      const cycleStart = Date.now();

      for (const scraper of this.scrapers) {
        try {
          console.log(`\n📰 Ejecutando: ${scraper.name}`);
          const start = Date.now();
          
          const news = await scraper.scrape();
          const duration = ((Date.now() - start) / 1000).toFixed(2);
          
          cycleNews += news.length;
          totalNews += news.length;

          allResults.push({
            ciclo: cycle,
            scraper: scraper.name,
            noticias: news.length,
            tiempo: `${duration}s`,
            totalAcumulado: totalNews
          });

          console.log(`✅ ${scraper.name}: ${news.length} noticias (Total: ${totalNews})`);

          // Pausa entre scrapers
          await this.delay(3000);
          
        } catch (error) {
          console.error(`❌ Error en ${scraper.name}:`, error.message);
          allResults.push({
            ciclo: cycle,
            scraper: scraper.name,
            noticias: 0,
            error: error.message
          });
        }
      }

      const cycleDuration = ((Date.now() - cycleStart) / 1000).toFixed(2);
      console.log(`\n📊 Ciclo ${cycle} completado en ${cycleDuration}s`);
      console.log(`🎯 Noticias este ciclo: ${cycleNews}`);
      console.log(`📈 Total acumulado: ${totalNews}/${targetCount}`);

      // Si aún no llegamos al objetivo, hacer otro ciclo
      if (totalNews < targetCount) {
        const remaining = targetCount - totalNews;
        const estimatedCycles = Math.ceil(remaining / cycleNews);
        
        console.log(`\n⏳ Necesitamos ~${estimatedCycles} ciclos más`);
        console.log(`💤 Esperando 2 minutos antes del próximo ciclo...`);
        
        await this.delay(120000); // 2 minutos de espera
        cycle++;
      }
    }

    console.log('\n🎉 ===== SCRAPING MASIVO COMPLETADO =====');
    console.log(`✅ TOTAL FINAL: ${totalNews} noticias recolectadas`);
    console.log(`🔄 Ciclos ejecutados: ${cycle}`);
    console.log(`⏰ Tiempo total: ${this.formatTime(allResults)}`);

    // Mostrar resumen por medio
    this.showSummary(allResults);

    return { totalNews, results: allResults };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatTime(results) {
    const totalSeconds = results.reduce((sum, result) => {
      const time = parseFloat(result.tiempo) || 0;
      return sum + time;
    }, 0);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}m ${seconds}s`;
  }

  showSummary(results) {
    const summary = {};
    
    results.forEach(result => {
      if (!summary[result.scraper]) {
        summary[result.scraper] = 0;
      }
      summary[result.scraper] += result.noticias;
    });

    console.log('\n📊 RESUMEN POR MEDIO:');
    Object.entries(summary).forEach(([medio, cantidad]) => {
      console.log(`   ${medio}: ${cantidad} noticias`);
    });
  }

  // Métodos existentes (runAll y runSpecific)
  async runAll() {
    console.log('\n🚀 ===== INICIANDO SCRAPING NORMAL =====');
    await this.initializeScrapers();

    let totalNews = 0;
    const results = [];

    for (const scraper of this.scrapers) {
      try {
        const start = Date.now();
        console.log(`\n📰 Ejecutando: ${scraper.name}`);
        const news = await scraper.scrape();
        const duration = ((Date.now() - start) / 1000).toFixed(2);

        totalNews += news.length;
        results.push({
          scraper: scraper.name,
          newsCount: news.length,
          duration: `${duration}s`
        });

        console.log(`✅ ${scraper.name}: ${news.length} noticias encontradas`);
        await this.delay(2000);
      } catch (err) {
        console.error(`❌ Error en ${scraper.name}:`, err.message);
        results.push({
          scraper: scraper.name,
          newsCount: 0,
          error: err.message
        });
      }
    }

    console.log('\n📊 ===== RESUMEN =====');
    console.table(results);
    console.log(`✅ Total: ${totalNews} noticias nuevas\n`);

    return { totalNews, results };
  }

  async runSpecific(scraperName) {
    await this.initializeScrapers();
    const scraper = this.scrapers.find(s => 
      s.name.toLowerCase().includes(scraperName.toLowerCase())
    );
    
    if (!scraper) {
      console.log(`❌ Scraper "${scraperName}" no encontrado`);
      return { totalNews: 0, results: [] };
    }

    console.log(`\n🚀 Ejecutando scraper: ${scraper.name}\n`);
    const news = await scraper.scrape();
    return {
      totalNews: news.length,
      results: [{ scraper: scraper.name, newsCount: news.length }],
    };
  }
}

module.exports = ScraperManager;
