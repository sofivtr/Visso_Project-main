/**
 * Helper para construir URLs de imágenes desde el backend
 * @param {string} imagenUrl - URL de la imagen
 * @returns {string} URL completa de la imagen
 */
export function getImageUrl(imagenUrl) {
  if (!imagenUrl) return '/placeholder.jpg';
  
  // Si ya es una URL completa (ej: https://...), devolverla tal cual
  if (imagenUrl.startsWith('http')) return imagenUrl;
  
  // CORRECCIÓN CRÍTICA PARA PRODUCCIÓN:
  // No agregar dominio ni puerto. Usar ruta relativa.
  // Nginx se encargará de buscar esto en la carpeta correcta.
  return imagenUrl; 
}