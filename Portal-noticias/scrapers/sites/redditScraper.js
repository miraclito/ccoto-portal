const BaseScraper = require('../baseScraper');

class RedditScraper extends BaseScraper {
  constructor(categoryId) {
    super({
      name: 'Reddit News',
      baseUrl: 'https://www.reddit.com',
      categoryId: categoryId,
    });
  }

  async scrape() {
    const scrapedNews = [];
    try {
      console.log(`\n🕷️  Iniciando scraping de ${this.name}...`);

      const subreddits = [
        'worldnews',
        'news', 
        'noticias',
        'peru',
        'LatinAmerica'
      ];

      for (const subreddit of subreddits) {
        try {
          console.log(`\n📰 Analizando r/${subreddit}...`);
          
          const url = `${this.baseUrl}/r/${subreddit}/hot.json?limit=15`;
          const jsonData = await this.fetchPage(url);
          
          if (!jsonData) {
            console.log(`❌ No se pudo obtener r/${subreddit}`);
            continue;
          }

          const data = this.parseJSON(jsonData);
          if (!data || !data.data || !data.data.children) {
            console.log(`❌ Estructura JSON inválida en r/${subreddit}`);
            continue;
          }

          const posts = data.data.children;
          console.log(`📊 r/${subreddit}: ${posts.length} posts encontrados`);

          for (const post of posts) {
            try {
              const postData = post.data;
              
              if (this.isValidNewsPost(postData)) {
                const savedNews = await this.processAndSavePost(postData, subreddit);
                if (savedNews) {
                  scrapedNews.push(savedNews);
                }
              }

              // Pausa inteligente entre posts
              await this.smartDelay(500, 1500);
              
            } catch (postError) {
              console.error(`❌ Error procesando post:`, postError.message);
            }
          }

          console.log(`✅ r/${subreddit} completado`);
          
          // Pausa más larga entre subreddits
          await this.smartDelay(2000, 4000);
          
        } catch (subredditError) {
          console.error(`❌ Error en r/${subreddit}:`, subredditError.message);
        }
      }

      console.log(`\n✅ ${this.name} scraping completado: ${scrapedNews.length} noticias nuevas\n`);
      return scrapedNews;

    } catch (error) {
      console.error('❌ Error en scraping de Reddit:', error.message);
      return scrapedNews;
    }
  }

  isValidNewsPost(postData) {
    return (
      postData.title &&
      postData.title.length > 10 &&
      !postData.title.includes('[Removed]') &&
      !postData.over_18 &&
      postData.url &&
      postData.domain !== `self.${postData.subreddit}` // Evitar self posts sin contenido
    );
  }

  async processAndSavePost(postData, subreddit) {
    try {
      const title = postData.title;
      let content = postData.selftext || '';
      const sourceUrl = postData.url;
      const redditUrl = `${this.baseUrl}${postData.permalink}`;

      // Crear contenido si está vacío o es muy corto
      if (!content || content.length < 50) {
        content = `Noticia de ${postData.domain} compartida en Reddit r/${subreddit}.\n\n` +
                 `📊 ${postData.ups} upvotes • ${postData.num_comments} comentarios\n\n` +
                 `💬 Discusión: ${redditUrl}`;
      }

      const summary = `Reddit r/${subreddit} • ${postData.ups} ↑ ${postData.num_comments} 💬 • ${postData.domain}`;

      // Determinar imagen
      let imageUrl = null;
      if (this.isValidImageUrl(postData.url)) {
        imageUrl = postData.url;
      } else if (this.isValidImageUrl(postData.thumbnail)) {
        imageUrl = postData.thumbnail;
      }

      // Guardar en base de datos
      const saved = await this.saveNews({
        title: title,
        summary: summary,
        content: content,
        imageUrl: imageUrl,
        sourceUrl: sourceUrl,
        publishedAt: new Date(postData.created_utc * 1000) // Usar fecha de Reddit
      });

      return saved;

    } catch (error) {
      console.error('❌ Error procesando post Reddit:', error.message);
      return null;
    }
  }
}

module.exports = RedditScraper;
