import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Api } from '../assets/js/api';

const BrandCarousel = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Asegúrate de que este puerto coincida con tu backend
  const BASE_URL = 'http://localhost:8081';

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await Api.brands();
        // Filtramos marcas que tengan una imagen válida
        const marcasConImagen = data.filter(marca => 
            marca.imagen && marca.imagen.trim() !== ""
        );
        setBrands(marcasConImagen);
      } catch (error) {
        console.error("Error cargando marcas en el carrusel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Función corregida para armar la URL final
  const construirUrlImagen = (imagenPath) => {
    if (!imagenPath) return '';

    // Si ya es una URL web completa (ej: https://...), la devolvemos tal cual
    if (imagenPath.startsWith('http')) {
      return imagenPath;
    }

    // Aseguramos que la ruta relativa empiece con '/'
    const rutaLimpia = imagenPath.startsWith('/') ? imagenPath : `/${imagenPath}`;

    // Concatenamos el servidor + la ruta de la BD
    // Ej: http://localhost:8081 + /images/MARCAS/foto.png
    return `${BASE_URL}${rutaLimpia}`;
  };

  const linkStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (loading || brands.length === 0) return null;

  return (
    <div className="carousel-container">
      <div 
        className="slider-track" 
        style={{ '--num-brands': brands.length }}
      >
        {/* PRIMERA VUELTA (Originales) */}
        {brands.map((brand) => (
          <div className="slide" key={`original-${brand.id}`}>
            <Link to="/productos" style={linkStyle}>
              <img 
                src={construirUrlImagen(brand.imagen)} 
                alt={brand.nombre} 
                style={{
                    maxHeight: '80px', 
                    maxWidth: '100%',
                    objectFit: 'contain'
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                }} 
              />
            </Link>
          </div>
        ))}

        {/* SEGUNDA VUELTA (Duplicados para efecto infinito) */}
        {brands.map((brand) => (
          <div className="slide" key={`duplicate-${brand.id}`}>
            <Link to="/productos" style={linkStyle}>
              <img 
                src={construirUrlImagen(brand.imagen)} 
                alt={brand.nombre}
                style={{
                    maxHeight: '80px', 
                    maxWidth: '100%',
                    objectFit: 'contain'
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                }} 
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCarousel;