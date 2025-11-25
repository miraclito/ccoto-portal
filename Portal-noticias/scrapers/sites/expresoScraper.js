const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class ExpresoScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Diario Expreso',
      baseUrl: 'https://www.expreso.com.pe',
      categoryId: categoryId,
      headers: {
        Referer: 'https://www.expreso.com.pe',
      },
    });
  }

  async scrape() {
    const scrapedNews = [];
    try {
      console.log(`\n🕷️  Iniciando scraping de ${this.name}...`);

      const url = `${this.baseUrl}/ultimas-noticias`;
      const html = await this.fetchPage(url);
      if (!html) {
        console.log('❌ No se pudo obtener HTML de Expreso');
        return [];
      }

      const $ = this.parseHTML(html);
      const articles = [];

      // Selectores para Expreso
      $('article, .noticia, .news-item, .post').each((index, element) => {
        if (index >= 15) return false;
        const $article = $(element);

        const $link = $article.find('a').first();
        let link = $link.attr('href') || '';
        const title = cleanText($article.find('h2, h3, .title, .titulo').first().text()) || '';

        if (!title || !link || title.length < 10) return;

        if (link.startsWith('/')) link = `${this.baseUrl}${link}`;

        const $img = $article.find('img').first();
        const imageUrl = $img.attr('src') || $img.attr('data-src') || null;

        const summary = cleanText($article.find('p, .summary, .resumen').first().text());

        articles.push({ title, link, imageUrl, summary });
      });

      console.log(`📊 Encontrados ${articles.length} artículos en ${this.name}`);

      for (const article of articles) {
        try {
          console.log(`📄 Procesando: ${article.title.substring(0, 60)}...`);
          
          const articleHtml = await this.fetchPage(article.link);
          if (!articleHtml) continue;

          const $article = this.parseHTML(articleHtml);
          let content = '';

          $article('article p, .contenido p, .noticia-content p, .entry-content p').each((i, elem) => {
            const text = cleanText($article(elem).text());
            if (text && text.length > 30) content += text + '\n\n';
          });

          if (!content || content.length < 100) {
            content = article.summary || 'Contenido no disponible. Ver noticia completa en expreso.com.pe';
          }

          const saved = await this.saveNews({
            title: article.title,
            summary: article.summary || content.substring(0, 200),
            content: content,
            imageUrl: article.imageUrl,
            sourceUrl: article.link,
          });

          if (saved) scrapedNews.push(saved);

          await this.smartDelay(1500, 2500);
        } catch (e) {
          console.error(`❌ Error procesando: ${article.title} → ${e.message}`);
        }
      }

      console.log(`✅ ${this.name} scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;
    } catch (error) {
      console.error(`❌ Error en scraping de ${this.name}:`, error.message);
      return scrapedNews;
    }
  }
}

module.exports = ExpresoScraper;
