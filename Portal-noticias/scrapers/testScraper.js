const ScraperManager = require('./scraperManager');
const { sequelize } = require('../config/database');

async function test() {
  try {
    console.log('🧪 Probando scrapers...\n');
    
    const manager = new ScraperManager();
    await manager.runAll();
    
    console.log('\n✅ Prueba completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();
