const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class LaRepublicaScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'La República',
      baseUrl: 'https://larepublica.pe',
      categoryId: categoryId,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://larepublica.pe'
      }
    });

    // Múltiples secciones de La República
    this.sections = [
      '/ultimas-noticias',
      '/politica',
      '/economia',
      '/tecnologia',
      '/deportes',
      '/sociedad',
      '/peru'
    ];
  }

  async scrapeSection(sectionUrl) {
    const url = `${this.baseUrl}${sectionUrl}`;
    console.log(`  📄 Analizando sección: ${url}`);
    
    const html = await this.fetchPage(url);
    if (!html) return [];

    const $ = this.parseHTML(html);
    const articles = [];

    // Múltiples selectores para La República
    const articleSelectors = [
      'article',
      'div.Article',
      'div[class*="article"]',
      'div.news-item',
      'div[class*="card"]',
      'section[class*="story"]'
    ];

    articleSelectors.forEach(selector => {
      $(selector).each((index, element) => {
        if (articles.length >= 5) return false;

        const $article = $(element);
        
        const $link = $article.find('a[href*="larepublica.pe"], a[href*="/noticia/"]').first();
        const title = cleanText(
          $article.find('h2, h3, .Article__title, [class*="title"], [class*="headline"]').first().text()
        );
        let link = $link.attr('href');

        if (!title || !link || title.length < 15) return;

        if (link.startsWith('/')) {
          link = `${this.baseUrl}${link}`;
        } else if (!link.startsWith('http')) {
          return;
        }

        const $img = $article.find('img').first();
        const imageUrl = $img.attr('src') || 
                        $img.attr('data-src') || 
                        $img.attr('data-lazy') ||
                        $img.attr('data-original');
        
        const summary = cleanText(
          $article.find('p, .Article__summary, [class*="summary"], [class*="description"]').first().text()
        );

        if (!articles.find(a => a.link === link)) {
          articles.push({ title, link, imageUrl, summary, section: sectionUrl });
        }
      });
    });

    return articles;
  }

  async scrapeArticleContent(articleUrl) {
    const html = await this.fetchPage(articleUrl);
    if (!html) return null;

    const $ = this.parseHTML(html);
    let content = '';
    
    // Múltiples selectores para el contenido
    const contentSelectors = [
      'article p',
      '.Article__body p',
      'div[itemprop="articleBody"] p',
      '.content-body p',
      '.article-content p',
      'section[class*="body"] p'
    ];

    for (const selector of contentSelectors) {
      $(selector).each((i, elem) => {
        const text = cleanText($(elem).text());
        if (text.length > 50 && 
            !text.includes('suscríbete') &&
            !text.includes('suscriptor') &&
            !text.includes('Lee también')) {
          content += text + '\n\n';
        }
      });
      
      if (content.length > 200) break;
    }

    return content;
  }

  async scrape() {
    try {
      console.log(`\n🕷️  Iniciando scraping COMPLETO de ${this.name}...`);
      console.log(`📊 Analizando ${this.sections.length} secciones...\n`);
      
      const allArticles = [];
      const scrapedNews = [];

      // Recorrer todas las secciones
      for (const section of this.sections) {
        try {
          const articles = await this.scrapeSection(section);
          allArticles.push(...articles);
          
          console.log(`  ✅ Encontrados ${articles.length} artículos en ${section}`);
          
          // Pausa entre secciones
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error(`  ❌ Error en sección ${section}:`, error.message);
        }
      }

      console.log(`\n📊 TOTAL: ${allArticles.length} artículos encontrados en La República\n`);

      // Procesar cada artículo
      for (let i = 0; i < allArticles.length; i++) {
        const article = allArticles[i];
        
        try {
          console.log(`  [${i + 1}/${allArticles.length}] Procesando: ${article.title.substring(0, 50)}...`);
          
          const content = await this.scrapeArticleContent(article.link);
          
          if (!content || content.length < 100) {
            console.log(`  ⚠️  Contenido insuficiente`);
          }

          const savedNews = await this.saveNews({
            title: article.title,
            summary: article.summary || content.substring(0, 200),
            content: content || article.summary || 'Ver noticia completa en LaRepublica.pe',
            imageUrl: article.imageUrl,
            sourceUrl: article.link
          });

          if (savedNews) {
            scrapedNews.push(savedNews);
            console.log(`  ✅ Guardada`);
          } else {
            console.log(`  ⏭️  Ya existe`);
          }

          // Pausa entre artículos
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`  ❌ Error: ${article.title.substring(0, 30)}`);
        }
      }

      console.log(`\n✅ La República Scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;

    } catch (error) {
      console.error('❌ Error general en scraping de La República:', error.message);
      return [];
    }
  }
}

module.exports = LaRepublicaScraper;
