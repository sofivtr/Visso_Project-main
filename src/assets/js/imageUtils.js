/**
 * Helper para construir URLs de imágenes desde el backend
 * @param {string} imagenUrl - URL de la imagen
 * @returns {string} URL completa de la imagen
 */
export function getImageUrl(imagenUrl) {
  if (!imagenUrl) return '/placeholder.svg';
  
  // Si ya es una URL completa (ej: https://...), devolverla tal cual
  if (imagenUrl.startsWith('http')) return imagenUrl;
  
  // MODO DESARROLLO (localhost): Agregar URL base del backend
  // MODO PRODUCCIÓN (AWS): Usar ruta relativa (Nginx se encarga)
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  
  if (isDevelopment) {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    // Remover /api del final si existe
    const baseUrl = backendUrl.replace('/api', '');
    return `${baseUrl}${imagenUrl}`;
  }
  
  return imagenUrl; 
}