const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class Gestion21Scraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Gestión',
      baseUrl: 'https://gestion.pe',
      categoryId: categoryId,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://gestion.pe'
      }
    });

    this.sections = [
      '/ultimas-noticias',
      '/economia',
      '/tu-dinero',
      '/tecnologia',
      '/empresas',
      '/tendencias'
    ];
  }

  async scrapeSection(sectionUrl) {
    const url = `${this.baseUrl}${sectionUrl}`;
    console.log(`  📄 Analizando sección: ${url}`);
    
    const html = await this.fetchPage(url);
    if (!html) return [];

    const $ = this.parseHTML(html);
    const articles = [];

    $('article, div[class*="story"], div[class*="card"]').each((index, element) => {
      if (articles.length >= 5) return false;

      const $article = $(element);
      const $link = $article.find('a').first();
      const title = cleanText($article.find('h2, h3, [class*="title"]').first().text());
      let link = $link.attr('href');

      if (!title || !link || title.length < 15) return;

      if (link.startsWith('/')) {
        link = `${this.baseUrl}${link}`;
      }

      const $img = $article.find('img').first();
      const imageUrl = $img.attr('src') || $img.attr('data-src');
      const summary = cleanText($article.find('p').first().text());

      if (!articles.find(a => a.link === link)) {
        articles.push({ title, link, imageUrl, summary });
      }
    });

    return articles;
  }

  async scrapeArticleContent(articleUrl) {
    const html = await this.fetchPage(articleUrl);
    if (!html) return null;

    const $ = this.parseHTML(html);
    let content = '';
    
    $('article p, .article-body p, div[itemprop="articleBody"] p').each((i, elem) => {
      const text = cleanText($(elem).text());
      if (text.length > 50) {
        content += text + '\n\n';
      }
    });

    return content;
  }

  async scrape() {
    try {
      console.log(`\n🕷️  Iniciando scraping COMPLETO de ${this.name}...`);
      console.log(`📊 Analizando ${this.sections.length} secciones...\n`);
      
      const allArticles = [];
      const scrapedNews = [];

      for (const section of this.sections) {
        try {
          const articles = await this.scrapeSection(section);
          allArticles.push(...articles);
          console.log(`  ✅ ${articles.length} artículos en ${section}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`  ❌ Error en ${section}`);
        }
      }

      console.log(`\n📊 TOTAL: ${allArticles.length} artículos\n`);

      for (let i = 0; i < allArticles.length; i++) {
        const article = allArticles[i];
        
        try {
          console.log(`  [${i + 1}/${allArticles.length}] ${article.title.substring(0, 40)}...`);
          
          const content = await this.scrapeArticleContent(article.link);

          const savedNews = await this.saveNews({
            title: article.title,
            summary: article.summary || content?.substring(0, 200),
            content: content || article.summary || 'Ver en Gestion.pe',
            imageUrl: article.imageUrl,
            sourceUrl: article.link
          });

          if (savedNews) {
            scrapedNews.push(savedNews);
            console.log(`  ✅ Guardada`);
          }

          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`  ❌ Error`);
        }
      }

      console.log(`\n✅ Gestión: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;

    } catch (error) {
      console.error('❌ Error en Gestión:', error.message);
      return [];
    }
  }
}

module.exports = Gestion21Scraper;
