const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class ElComercioScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'El Comercio',
      baseUrl: 'https://elcomercio.pe',
      categoryId: categoryId,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://elcomercio.pe',
        'Connection': 'keep-alive'
      }
    });

    // Múltiples secciones de El Comercio
    this.sections = [
      '/ultimas-noticias',
      '/politica',
      '/economia',
      '/tecnologia',
      '/deportes',
      '/lima',
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

    // Múltiples selectores para El Comercio
    const articleSelectors = [
      'article',
      'div.story-item',
      'div[class*="story"]',
      'div[class*="card"]',
      'div.news-item',
      'section[class*="article"]'
    ];

    // Usar for...of para permitir await dentro del loop
    for (const selector of articleSelectors) {
      const elements = $(selector);
      for (let i = 0; i < elements.length; i++) {
        if (articles.length >= 5) break;

        const element = elements[i];
        const $article = $(element);

        const $link = $article.find('a[href*="elcomercio.pe"], a[href*="/noticia/"], a[href*="/news/"]').first();
        const title = cleanText(
          $article.find('h2, h3, h4, .story__title, [class*="title"], [class*="headline"]').first().text()
        );
        let link = $link.attr('href');

        if (!title || !link || title.length < 15) continue;

        if (link.startsWith('/')) {
          link = `${this.baseUrl}${link}`;
        } else if (!link.startsWith('http')) {
          continue;
        }

        // USAR EL NUEVO MÉTODO DE EXTRACCIÓN DE IMÁGENES
        const imageUrl = await this.extractImage($article, link);

        const summary = cleanText(
          $article.find('p, .story__summary, [class*="summary"], [class*="description"]').first().text()
        );

        // Evitar duplicados en la misma sesión
        if (!articles.find(a => a.link === link)) {
          articles.push({ title, link, imageUrl, summary, section: sectionUrl });
        }
      }
    }

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
      '.story-contents p',
      'div[itemprop="articleBody"] p',
      '.article-body p',
      '.content-body p',
      'section[class*="content"] p'
    ];

    for (const selector of contentSelectors) {
      $(selector).each((i, elem) => {
        const text = cleanText($(elem).text());
        if (text.length > 50 &&
          !text.includes('suscríbete') &&
          !text.includes('premium') &&
          !text.includes('suscriptor')) {
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

      console.log(`\n📊 TOTAL: ${allArticles.length} artículos encontrados en El Comercio\n`);

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
            content: content || article.summary || 'Ver noticia completa en ElComercio.pe',
            imageUrl: article.imageUrl,
            sourceUrl: article.link,
            type: 'scraped',      // 👈 MUY IMPORTANTE: marcar como scrapeada
            isPublished: true,    // opcional, si quieres que salga pública de frente
            authorId: null        // o el id de un usuario “Sistema” si tienes uno
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

      console.log(`\n✅ El Comercio Scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;

    } catch (error) {
      console.error('❌ Error general en scraping de El Comercio:', error.message);
      return [];
    }
  }
}

module.exports = ElComercioScraper;
