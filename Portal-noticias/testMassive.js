// testMassive.js
const ScraperManager = require('./scrapers/scraperManager');

async function runMassiveScraping() {
  console.log('🔥 INICIANDO SCRAPING MASIVO PARA 1000+ NOTICIAS\n');
  
  const manager = new ScraperManager();
  
  try {
    const result = await manager.runMassiveScraping(1000);
    
    console.log('\n🎉 MISION CUMPLIDA!');
    console.log(`📊 Total noticias en BD: ${result.totalNews}`);
    
    if (result.totalNews >= 1000) {
      console.log('✅ ¡OBJETIVO ALCANZADO! 1000+ noticias recolectadas');
    } else {
      console.log(`⚠️  Se recolectaron ${result.totalNews} noticias (meta: 1000)`);
    }
    
  } catch (error) {
    console.error('❌ Error en scraping masivo:', error);
  }
}

// Ejecutar
runMassiveScraping();
