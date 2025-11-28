const axios = require('axios');
const cheerio = require('cheerio');
const { News } = require('../models');
const { cleanText } = require('../utils/helpers');

class BaseScraper {
  constructor(config) {
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.categoryId = config.categoryId;
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.google.com/',
      ...config.headers
    };
  }

  async fetchPage(url, options = {}) {
    try {
      const config = {
        headers: this.headers,
        timeout: 15000,
        ...options
      };

      // Si es una URL de Reddit (JSON), cambiar headers
      if (url.includes('reddit.com') && url.includes('.json')) {
        config.headers = {
          ...config.headers,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregatorBot/1.0; +http://yourdomain.com)'
        };
      }

      const response = await axios.get(url, config);

      // Verificar si es JSON o HTML
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json') || url.includes('.json')) {
        return response.data; // Devolver JSON directamente
      }

      return response.data; // Devolver HTML

    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);

      // Manejar errores específicos
      if (error.response) {
        if (error.response.status === 429) {
          console.log('⚠️  Rate limit alcanzado, esperando 30 segundos...');
          await new Promise(r => setTimeout(r, 30000));
        } else if (error.response.status === 403) {
          console.log('🚫 Acceso prohibido, intentando con proxy...');
        } else if (error.response.status === 404) {
          console.log('🔍 Página no encontrada (404)');
        }
      }

      return null;
    }
  }

  parseHTML(html) {
    return cheerio.load(html);
  }

  // Método específico para parsear JSON (para Reddit)
  parseJSON(data) {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (error) {
      console.error('❌ Error parseando JSON:', error.message);
      return null;
    }
  }

  // Generar slug automáticamente
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // elimina acentos
      .replace(/[^a-z0-9\s]/g, '') // elimina caracteres especiales pero mantiene espacios
      .replace(/\s+/g, '-') // reemplaza espacios con guiones
      .substring(0, 100) // limita longitud
      .replace(/-$/, '') // elimina guión final si existe
      .replace(/^-/, ''); // elimina guión inicial si existe
  }

  // Validar URL de imagen
  isValidImageUrl(url) {
    if (!url || url === 'self' || url === 'default' || url === 'image' || url === 'nsfw') {
      return false;
    }

    const imagePatterns = [
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i,
      /imgur\.com\/[a-zA-Z0-9]+$/i,
      /redd\.it\/[a-zA-Z0-9]+$/i,
      /i\.redd\.it\/[a-zA-Z0-9]+\.[a-z]+$/i
    ];

    return imagePatterns.some(pattern => pattern.test(url));
  }

  // Limpiar contenido HTML/Reddit
  cleanContent(content) {
    if (!content) return '';

    return content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remover markdown links [text](url)
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remover **bold**
      .replace(/\*([^*]+)\*/g, '$1') // Remover *italic*
      .replace(/#{1,6}\s?/g, '') // Remover headers markdown
      .replace(/\n{3,}/g, '\n\n') // Normalizar saltos de línea
      .replace(/>\s?/g, '') // Remover quotes de Reddit
      .trim();
  }

  /**
   * Intenta extraer una imagen válida de un elemento o URL
   * @param {Object} $element - Elemento Cheerio donde buscar (opcional)
   * @param {String} articleUrl - URL del artículo para buscar og:image (opcional)
   */
  async extractImage($element, articleUrl = null) {
    let imageUrl = null;

    // 1. Intentar extraer del elemento HTML (card/item de la lista)
    if ($element) {
      const $ = this.parseHTML(''); // Necesario para usar helpers de cheerio si $element es un objeto cheerio
      const imgCandidates = [
        // Atributos directos en el elemento o sus hijos
        () => $element.find('img').attr('src'),
        () => $element.find('img').attr('data-src'),
        () => $element.find('img').attr('data-original'),
        () => $element.find('img').attr('data-lazy-src'),
        () => $element.find('img').attr('srcset')?.split(',')[0]?.split(' ')[0], // Primera imagen del srcset

        // Buscar en etiquetas source (picture)
        () => $element.find('picture source').attr('srcset')?.split(',')[0]?.split(' ')[0],

        // Buscar en estilos background-image
        () => {
          const style = $element.find('[style*="background-image"]').attr('style');
          const match = style?.match(/url\(['"]?(.*?)['"]?\)/);
          return match ? match[1] : null;
        }
      ];

      for (const getCandidate of imgCandidates) {
        try {
          const url = getCandidate();
          if (url && this.isValidImageUrl(url)) {
            imageUrl = url;
            break;
          }
        } catch (e) {
          // Ignorar errores de selectores
        }
      }
    }

    // 2. Si no se encontró imagen y tenemos URL del artículo, intentar buscar og:image
    if (!imageUrl && articleUrl) {
      try {
        console.log(`    🔍 Buscando imagen en detalle: ${articleUrl}`);
        const html = await this.fetchPage(articleUrl);
        if (html) {
          const $page = this.parseHTML(html);
          const ogImage = $page('meta[property="og:image"]').attr('content') ||
            $page('meta[name="twitter:image"]').attr('content') ||
            $page('link[rel="image_src"]').attr('href');

          if (ogImage && this.isValidImageUrl(ogImage)) {
            imageUrl = ogImage;
            console.log(`    📸 Imagen encontrada en detalle: ${imageUrl.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Error buscando imagen en detalle: ${error.message}`);
      }
    }

    // 3. Normalizar URL relativa
    if (imageUrl && imageUrl.startsWith('/')) {
      const urlObj = new URL(this.baseUrl);
      imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
    }

    return imageUrl;
  }

  async saveNews(newsData) {
    try {
      // Validar datos requeridos
      if (!newsData.title || !newsData.title.trim()) {
        console.log('❌ Título vacío, omitiendo...');
        return null;
      }

      // Generar slug automáticamente
      const slug = this.generateSlug(newsData.title);

      // Verificar si ya existe una noticia con el mismo slug
      const existingNews = await News.findOne({
        where: { slug }
      });

      if (existingNews) {
        console.log(`⏭️  Ya existe: ${newsData.title.substring(0, 50)}...`);
        return null;
      }

      // Limpiar y preparar datos
      const cleanData = {
        title: newsData.title.trim(),
        summary: (newsData.summary || newsData.title.substring(0, 200)).trim(),
        content: this.cleanContent(newsData.content || ''),
        imageUrl: this.isValidImageUrl(newsData.imageUrl) ? newsData.imageUrl : null,
        sourceUrl: newsData.sourceUrl || '',
        categoryId: this.categoryId,
        slug: slug,
        publishedAt: newsData.publishedAt || new Date(),
        type: 'scraped', // ← MARCADOR PARA NOTICIAS SCRAPEADAS
        isPublished: newsData.isPublished !== undefined ? newsData.isPublished : true // Por defecto publicadas
      };

      // Validar longitud mínima
      if (cleanData.title.length < 5) {
        console.log('❌ Título muy corto, omitiendo...');
        return null;
      }

      // Crear nueva noticia
      const news = await News.create(cleanData);

      console.log(`✅ Guardada (SCRAPED): ${cleanData.title.substring(0, 60)}...`);
      return news;

    } catch (error) {
      console.error(`❌ Error guardando noticia:`, error.message);

      // Log más detallado para debugging
      if (error.name === 'SequelizeValidationError') {
        console.error('Errores de validación:', error.errors.map(e => e.message));
      }

      return null;
    }
  }

  // Método para hacer pausas inteligentes
  async smartDelay(minMs = 1000, maxMs = 3000) {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Método abstracto que debe ser implementado por los scrapers hijos
  async scrape() {
    throw new Error('Método scrape() debe ser implementado por la clase hija');
  }
}

module.exports = BaseScraper;
