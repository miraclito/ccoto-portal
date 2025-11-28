const BaseScraper = require('./baseScraper');

class GenericScraper extends BaseScraper {
    constructor(sourceConfig, categoryId) {
        super({
            name: sourceConfig.name,
            baseUrl: sourceConfig.url,
            categoryId: categoryId
        });
        this.selectors = sourceConfig.selectors;
    }

    async scrape() {
        try {
            console.log(`\n🔍 Scraping ${this.name} (Generic)...`);
            const html = await this.fetchPage(this.baseUrl);
            if (!html) return [];

            const $ = this.parseHTML(html);
            const news = [];
            const seenTitles = new Set();

            // Estrategia de Selectores con Fallback
            const trySelectors = (primary, defaults) => {
                const candidates = [primary, ...defaults].filter(Boolean);
                for (const selector of candidates) {
                    const elements = $(selector);
                    if (elements.length > 0) {
                        console.log(`   ✅ Usando selector: "${selector}" (${elements.length} elementos)`);
                        return { selector, elements };
                    }
                }
                return { selector: null, elements: [] };
            };

            // 1. Encontrar artículos
            const articleDefaults = ['article', '.post', '.card', '.news-item', '.story', '.entry', 'div[class*="article"]', 'div[class*="news"]'];
            const { elements: articles } = trySelectors(this.selectors.articleSelector, articleDefaults);

            if (articles.length === 0) {
                console.log('   ⚠️ No se encontraron artículos con ningún selector.');
                return [];
            }

            for (let i = 0; i < articles.length; i++) {
                try {
                    const $el = $(articles[i]);

                    // 2. Encontrar Título
                    let title = '';
                    const titleDefaults = ['h1', 'h2', 'h3', '.title', '.headline', 'a[class*="title"]'];

                    // Intentar selectores dentro del elemento
                    for (const sel of [this.selectors.titleSelector, ...titleDefaults].filter(Boolean)) {
                        title = this.cleanContent($el.find(sel).text());
                        if (title) break;
                    }

                    // Si no hay título, intentar buscar el primer enlace con texto significativo
                    if (!title) {
                        title = this.cleanContent($el.find('a').first().text());
                    }

                    if (!title || seenTitles.has(title)) continue;

                    // 3. Encontrar Enlace
                    let link = '';
                    const linkDefaults = ['a', 'a.link', '.title a'];

                    for (const sel of [this.selectors.linkSelector, ...linkDefaults].filter(Boolean)) {
                        link = $el.find(sel).attr('href');
                        if (link) break;
                    }

                    // Fallback: si el propio elemento es un enlace
                    if (!link && $el.is('a')) link = $el.attr('href');

                    if (link) {
                        if (link.startsWith('/')) {
                            const urlObj = new URL(this.baseUrl);
                            link = `${urlObj.protocol}//${urlObj.host}${link}`;
                        }
                    } else {
                        continue;
                    }

                    // 4. Encontrar Imagen
                    let imageUrl = null;
                    // Intentar selector configurado
                    if (this.selectors.imageSelector) {
                        const $img = $el.find(this.selectors.imageSelector);
                        imageUrl = $img.attr('src') || $img.attr('data-src') || $img.attr('srcset')?.split(' ')[0];

                        // Si es estilo background-image
                        if (!imageUrl) {
                            const style = $img.attr('style');
                            const match = style?.match(/url\(['"]?(.*?)['"]?\)/);
                            if (match) imageUrl = match[1];
                        }
                    }

                    // Fallback automático inteligente (busca img, og:image, style background)
                    if (!imageUrl) {
                        imageUrl = await this.extractImage($el, link);
                    }

                    // 5. Resumen (Opcional)
                    let summary = '';
                    if (this.selectors.summarySelector) {
                        summary = this.cleanContent($el.find(this.selectors.summarySelector).text());
                    }

                    seenTitles.add(title);

                    const savedNews = await this.saveNews({
                        title,
                        summary,
                        content: '',
                        imageUrl,
                        sourceUrl: link,
                        publishedAt: new Date()
                    });

                    if (savedNews) news.push(savedNews);

                } catch (error) {
                    console.error(`❌ Error procesando elemento en ${this.name}:`, error.message);
                }
            }

            return news;
        } catch (error) {
            console.error(`❌ Error crítico en ${this.name}:`, error.message);
            return [];
        }
    }
}

module.exports = GenericScraper;
