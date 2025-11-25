const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class AmericaScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'América Noticias',
      baseUrl: 'https://www.americatv.com.pe',
      categoryId: categoryId,
      headers: {
        Referer: 'https://www.americatv.com.pe',
      },
    });
  }

  async scrape() {
    const scrapedNews = [];
    try {
      console.log(`\n🕷️  Iniciando scraping de ${this.name}...`);

      const url = `${this.baseUrl}/noticias`;
      const html = await this.fetchPage(url);
      if (!html) {
        console.log('❌ No se pudo obtener HTML de América Noticias');
        return [];
      }

      const $ = this.parseHTML(html);
      const articles = [];

      $('article, .noticia, .news-item, .story').each((index, element) => {
        if (index >= 15) return false;
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

      console.log(`📊 Encontrados ${articles.length} artículos en ${this.name}`);

      for (const article of articles) {
        try {
          console.log(`📄 Procesando: ${article.title.substring(0, 60)}...`);
          
          const articleHtml = await this.fetchPage(article.link);
          if (!articleHtml) continue;

          const $article = this.parseHTML(articleHtml);
          let content = '';

          $article('article p, .contenido p, .noticia-content p').each((i, elem) => {
            const text = cleanText($article(elem).text());
            if (text && text.length > 30) content += text + '\n\n';
          });

          if (!content || content.length < 100) {
            content = article.summary || 'Contenido no disponible. Ver noticia completa en americatv.com.pe';
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

module.exports = AmericaScraper;
