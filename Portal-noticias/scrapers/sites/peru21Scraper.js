const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class Peru21Scraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Perú 21',
      baseUrl: 'https://peru21.pe',
      categoryId,
      headers: {
        Referer: 'https://peru21.pe',
      },
    });
  }

  async scrape() {
    const scrapedNews = [];
    try {
      console.log(`\n🕷️  Iniciando scraping de ${this.name}...`);

      const url = `${this.baseUrl}/archivo/todas`;
      const html = await this.fetchPage(url);
      if (!html) return [];

      const $ = this.parseHTML(html);
      const articles = [];

      // Selectores para Perú 21
      $('article, .story-item, .news-item').each((index, element) => {
        if (index >= 10) return false; // limitar a 10
        const $article = $(element);

        const $link = $article.find('a').first();
        let link = $link.attr('href') || '';
        const title = cleanText($article.find('h2, h3, .title').first().text()) || '';

        if (!title || !link || title.length < 10) return;

        if (link.startsWith('/')) link = `${this.baseUrl}${link}`;

        const $img = $article.find('img').first();
        const imageUrl = $img.attr('src') || $img.attr('data-src') || null;

        const summary = cleanText($article.find('p, .summary').first().text());

        articles.push({ title, link, imageUrl, summary });
      });

      console.log(`📊 Encontrados ${articles.length} artículos en Perú 21`);

      for (const article of articles) {
        try {
          const articleHtml = await this.fetchPage(article.link);
          if (!articleHtml) continue;

          const $article = this.parseHTML(articleHtml);
          let content = '';

          // Selectores de contenido para Perú 21
          $article('article p, .story-content p, .article-body p').each((i, elem) => {
            const text = cleanText($article(elem).text());
            if (text && text.length > 50) content += text + '\n\n';
          });

          if (!content || content.length < 100) {
            content = article.summary || 'Contenido no disponible. Ver noticia completa en Perú21.pe';
          }

          const saved = await this.saveNews({
            title: article.title,
            summary: article.summary || content.substring(0, 200),
            content: content,
            imageUrl: article.imageUrl,
            sourceUrl: article.link,
          });

          if (saved) scrapedNews.push(saved);

          // pausa anti-baneo
          await new Promise((r) => setTimeout(r, 1500));
        } catch (e) {
          console.error(`❌ Error procesando: ${article.title} → ${e.message}`);
        }
      }

      console.log(`✅ Perú 21 Scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;
    } catch (error) {
      console.error('❌ Error en scraping de Perú 21:', error.message);
      return scrapedNews;
    }
  }
}

module.exports = Peru21Scraper;
