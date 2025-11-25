const BaseScraper = require('./scrapers/baseScraper');

class TestScraper extends BaseScraper {
  constructor() {
    super({
      name: 'Test Headers',
      baseUrl: 'https://rpp.pe',
      categoryId: 1,
    });
  }

  async test() {
    console.log('🧪 Probando nuevos headers...\n');
    
    const url = 'https://rpp.pe/ultimas-noticias';
    console.log(`📡 Conectando a: ${url}`);
    
    const html = await this.fetchPage(url);
    
    if (html) {
      console.log('✅ ¡ÉXITO! Headers funcionan correctamente');
      console.log(`📄 Tamaño del HTML: ${html.length} caracteres`);
      
      const $ = this.parseHTML(html);
      const articles = $('article, .news-item, [data-type="article"]');
      console.log(`📊 Artículos encontrados: ${articles.length}`);
      
    } else {
      console.log('❌ Los headers NO funcionaron');
    }
  }
}

// Ejecutar prueba
const tester = new TestScraper();
tester.test();
