// Crear slug desde texto
const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .trim()
    .substring(0, 200);
};

// Limpiar texto HTML
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .replace(/\s+/g, ' ') // Múltiples espacios a uno
    .trim();
};

// Validar URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Normalizar URL (agregar protocolo si falta)
const normalizeUrl = (url, baseUrl) => {
  if (!url) return null;
  
  // Si es URL absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es URL relativa
  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${url}`;
  }
  
  // Si es URL relativa sin /
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Extraer dominio de URL
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return null;
  }
};

module.exports = {
  createSlug,
  cleanText,
  isValidUrl,
  normalizeUrl,
  extractDomain
};

