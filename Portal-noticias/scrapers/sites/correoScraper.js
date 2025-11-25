const BaseScraper = require('../baseScraper');
const { cleanText } = require('../../utils/helpers');

class CorreoScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Diario Correo',
      baseUrl: 'https://diariocorreo.pe',
      categoryId: categoryId,
      headers: {
        Referer: 'https://diariocorreo.pe',
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
        console.log('❌ No se pudo obtener HTML de Correo');
        return [];
      }

      const $ = this.parseHTML(html);
      const articles = [];

      // Selectores para Diario Correo
      $('article, .story, .news-item, .noticia').each((index, element) => {
        if (index >= 10) return false; // Limitar a 10 artículos
        const $article = $(element);

        const $link = $article.find('a').first();
        let link = $link.attr('href') || '';
        const title = cleanText($article.find('h2, h3, .title').first().text()) || '';

        if (!title || !link || title.length < 10) return;

        // Asegurar que el link sea completo
        if (link.startsWith('/')) {
          link = `${this.baseUrl}${link}`;
        } else if (!link.startsWith('http')) {
          link = `${this.baseUrl}/${link}`;
        }

        const $img = $article.find('img').first();
        const imageUrl = $img.attr('src') || $img.attr('data-src') || null;

        const summary = cleanText($article.find('p, .summary').first().text());

        articles.push({ 
          title, 
          link, 
          imageUrl, 
          summary 
        });
      });

      console.log(`📊 Encontrados ${articles.length} artículos en ${this.name}`);

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
          $article('article p, .story-content p, .article-body p, .content p, .noticia-content p').each((i, elem) => {
            const text = cleanText($article(elem).text());
            if (text && text.length > 30) {
              content += text + '\n\n';
            }
          });

          // Si no se encontró contenido suficiente, usar el resumen
          if (!content || content.length < 100) {
            content = article.summary || 'Contenido no disponible. Ver noticia completa en diariocorreo.pe';
          }

          // Guardar en la base de datos
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

      console.log(`✅ ${this.name} scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;
      
    } catch (error) {
      console.error(`❌ Error en scraping de ${this.name}:`, error.message);
      return scrapedNews;
    }
  }
}

module.exports = CorreoScraper;
