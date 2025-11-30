/**
 * Helper para construir URLs de imágenes desde el backend
 * @param {string} imagenUrl - URL de la imagen (ej: "/images/PRODUCTOS/SOL/s_1.webp")
 * @returns {string} URL completa de la imagen
 */
export function getImageUrl(imagenUrl) {
  if (!imagenUrl) return '/placeholder.jpg';
  if (imagenUrl.startsWith('http')) return imagenUrl;
  
  // Todas las imágenes vienen de /images/ (tanto productos iniciales como nuevos)
  return `http://localhost:8081${imagenUrl}`;
}
