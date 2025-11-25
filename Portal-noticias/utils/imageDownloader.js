const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImageDownloader {
  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || './uploads/news';
    
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Generar nombre único para imagen
  generateFileName(url) {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = path.extname(url).split('?')[0] || '.jpg';
    return `scraped-${hash}${ext}`;
  }

  // Descargar imagen desde URL
  async downloadImage(imageUrl) {
    try {
      if (!imageUrl || imageUrl === '') {
        return null;
      }

      // Si ya es una ruta local, retornarla
      if (imageUrl.startsWith('/uploads/')) {
        return imageUrl;
      }

      // Validar que sea una URL válida
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return null;
      }

      const fileName = this.generateFileName(imageUrl);
      const filePath = path.join(this.uploadDir, fileName);

      // Verificar si ya existe
      if (fs.existsSync(filePath)) {
        return `/uploads/news/${fileName}`;
      }

      console.log(`📥 Descargando imagen: ${imageUrl.substring(0, 50)}...`);

      // Descargar imagen
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Guardar imagen
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Imagen guardada: ${fileName}`);
          resolve(`/uploads/news/${fileName}`);
        });
        writer.on('error', (error) => {
          console.error(`❌ Error guardando imagen: ${error.message}`);
          reject(error);
        });
      });

    } catch (error) {
      console.error(`❌ Error descargando imagen: ${error.message}`);
      return null;
    }
  }

  // Limpiar imágenes antiguas (opcional)
  async cleanOldImages(daysOld = 30) {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        if (!file.startsWith('scraped-')) continue;

        const filePath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      console.log(`🗑️  ${deletedCount} imágenes antiguas eliminadas`);
      return deletedCount;

    } catch (error) {
      console.error('Error limpiando imágenes:', error);
      return 0;
    }
  }
}

module.exports = new ImageDownloader();
