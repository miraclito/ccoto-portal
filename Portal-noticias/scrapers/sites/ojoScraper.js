const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class OjoScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Ojo.pe',
      baseUrl: 'https://ojo.pe',
      categoryId: categoryId,
      headers: {
        Referer: 'https://ojo.pe',
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
        console.log(`❌ ${this.name}: No se pudo obtener HTML`);
        return [];
      }

      const $ = this.parseHTML(html);
      const articles = [];

      // Selectores para Ojo.pe
      $('.story, .news-item, .noticia, article, .post, .news-list-item').each((index, element) => {
        if (index >= 10) return false; // Limitar a 10 artículos
        const $element = $(element);

        const title = cleanText($element.find('h2, h3, h4, .title, .titulo, .entry-title').first().text()) || '';
        let link = $element.find('a').first().attr('href') || '';
        const imageUrl = $element.find('img').first().attr('src') || 
                        $element.find('img').first().attr('data-src') || null;
        const summary = cleanText($element.find('p, .summary, .excerpt, .resumen').first().text()) || '';

        if (!title || !link || title.length < 10) return;

        // Asegurar que el link sea completo
        if (link.startsWith('/')) {
          link = `${this.baseUrl}${link}`;
        } else if (!link.startsWith('http')) {
          link = `${this.baseUrl}/${link}`;
        }

        articles.push({
          title,
          link,
          imageUrl,
          summary
        });
      });

      console.log(`📊 ${this.name}: ${articles.length} noticias encontradas`);

      // Procesar cada artículo individualmente
      for (const article of articles) {
        try {
          console.log(`📄 Procesando: ${article.title.substring(0, 60)}...`);
          
          const articleHtml = await this.fetchPage(article.link);
          if (!articleHtml) {
            console.log(`❌ No se pudo obtener contenido de: ${article.link}`);
            continue;
          }

          const $article = this.parseHTML(articleHtml);
          let content = '';

          // Extraer contenido de la noticia
          $article('article p, .story-content p, .article-body p, .content p, .noticia-content p, .entry-content p').each((i, elem) => {
            const text = cleanText($article(elem).text());
            if (text && text.length > 30) {
              content += text + '\n\n';
            }
          });

          // Si no se encontró contenido suficiente, usar el resumen
          if (!content || content.length < 100) {
            content = article.summary || 'Contenido no disponible. Ver noticia completa en ojo.pe';
          }

          // Guardar en la base de datos (UNO por UNO)
          const saved = await this.saveNews({
            title: article.title,
            summary: article.summary || content.substring(0, 200) + '...',
            content: content,
            imageUrl: article.imageUrl,
            sourceUrl: article.link,
          });

          if (saved) {
            scrapedNews.push(saved);
          }

          // Pausa para evitar ser bloqueado
          await new Promise((resolve) => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Error procesando artículo: ${article.title} → ${error.message}`);
        }
      }

      console.log(`💾 ${this.name}: ${scrapedNews.length} noticias guardadas en BD\n`);
      return scrapedNews;
      
    } catch (error) {
      console.error(`❌ Error scraping ${this.name}:`, error.message);
      return scrapedNews;
    }
  }
}

module.exports = OjoScraper;
