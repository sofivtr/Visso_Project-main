import React, { useState, useEffect } from 'react';
import images from '../assets/js/images';
import { Link, useNavigate } from 'react-router-dom';
import BrandCarousel from './BrandCarousel';
import Nosotros from './Nosotros';
import Contacto from './Contacto';
import { Api } from '../assets/js/api';
import { getImageUrl } from '../assets/js/imageUtils';
import { getCurrentUser } from '../assets/js/session';

function Home() {
  const navigate = useNavigate();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductosDestacados = async () => {
      try {
        const productos = await Api.products();
        // Filtrar SOLO productos de categorías sin cotización: Lentes de sol, Accesorios, Lentes de contacto
        const categoriasSinCotizacion = ['Lentes de sol', 'Accesorios', 'Lentes de contacto'];
        const destacados = productos
          .filter(p => 
            p.stock > 0 && 
            categoriasSinCotizacion.includes(p.categoria?.nombre)
          )
          .slice(0, 3);
        setProductosDestacados(destacados);
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductosDestacados();
  }, []);

  // Función para compra rápida: agregar al carrito y redirigir
  const compraRapida = async (producto) => {
    const usuario = getCurrentUser();
    
    if (!usuario) {
      alert('Debes iniciar sesión para comprar');
      navigate('/auth');
      return;
    }

    try {
      // Agregar al carrito usando la función correcta
      await Api.addToCarrito({
        usuarioId: usuario.id,
        productoId: producto.id,
        cantidad: 1
      });
      // Sincronizar localStorage y disparar evento para actualizar el contador del header
      try {
        const nuevoCarrito = await Api.getCarrito(usuario.id);
        const itemsLS = (nuevoCarrito?.detalles || []).map(item => ({
          id: item.producto?.id || item.id,
          nombre: item.nombreProducto,
          precio: item.cotizacion?.valorAprox || item.precioUnitario,
          cantidad: item.cantidad,
          imagenUrl: item.producto?.imagenUrl || ''
        }));
        localStorage.setItem('carrito', JSON.stringify(itemsLS));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        // Si falla la sincronización local, no interrumpe el flujo principal
        console.warn('No se pudo sincronizar localStorage del carrito:', e);
      }
      // Redirigir al carrito
      navigate('/carrito');
    } catch (error) {
      console.error('Error en compra rápida:', error);
      alert('Error al agregar al carrito: ' + (error.response?.data || error.message));
    }
  };

  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Función para ir a la tienda filtrando por categoría
  const goToCategory = (cat) => {
    navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
  };

  return (
    <main className="main">
      {/* =================== [SECCIÓN HERO] =================== */}
      <section id="hero" className="hero section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <h1>Tu visión, nuestra pasión</h1>
              <p>Descubre la colección más exclusiva de lentes y gafas de sol. Calidad premium, diseños únicos y la mejor atención personalizada.</p>
              <div className="d-flex">
                <Link to="/productos" className="btn-get-started">
                  <i className="bi bi-bag-heart me-2"></i>
                  VER PRODUCTOS
                </Link>
              </div>
              <div className="mt-4">
                <p className="text-muted small mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Envío gratis en compras sobre $50.000
                </p>
                <p className="text-muted small mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Garantía de calidad certificada
                </p>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img">
              <Link to="/productos" style={{ cursor: 'pointer' }}>
                <img src={images.demo} className="img-fluid animated" alt="Gafas modernas" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================== [SECCIÓN CARRUSEL MARCAS] =================== */}
      <section id="tienda" className="tienda section bg-light py-5">
        <div className="container section-title mb-3">
          <h2>Nuestras Marcas</h2>
          <p>Descubre las colecciones exclusivas de las mejores marcas del mundo.</p>
        </div>
        <div className="container">
          <BrandCarousel />
        </div>
      </section>

      {/* =================== [COMPRA RÁPIDA - PRODUCTOS DESTACADOS] =================== */}
      <section className="compra-rapida section py-5 bg-white">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">{productosDestacados.map(producto => (
                <div key={producto.id} className="col-lg-4 col-md-6">
                  <div 
                    className="card h-100 shadow-sm border-0 position-relative overflow-hidden"
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Badge de stock */}
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-success">En Stock: {producto.stock}</span>
                    </div>

                    {/* Imagen del producto */}
                    <div 
                      className="position-relative" 
                      style={{height: '300px', overflow: 'hidden', backgroundColor: '#f8f9fa'}}
                      onClick={() => navigate(`/productos?search=${encodeURIComponent(producto.nombre)}`)}
                    >
                      <img 
                        src={getImageUrl(producto.imagenUrl)} 
                        alt={producto.nombre}
                        className="w-100 h-100"
                        style={{objectFit: 'contain', padding: '20px'}}
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge bg-primary">{producto.marca?.nombre || 'Sin marca'}</span>
                        <span className="badge bg-secondary ms-2">{producto.categoria?.nombre || 'Sin categoría'}</span>
                      </div>
                      <h5 className="card-title mb-2">{producto.nombre}</h5>
                      <p className="card-text text-muted small mb-3" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {producto.descripcion || 'Sin descripción disponible'}
                      </p>
                      
                      {/* Precio y botón */}
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <small className="text-muted d-block">Precio</small>
                            <h4 className="text-primary mb-0">{formatCLP(producto.precio)}</h4>
                          </div>
                        </div>
                        
                        {/* Botón de compra rápida */}
                        <button 
                          className="btn btn-success w-100 btn-lg fw-semibold"
                          onClick={() => compraRapida(producto)}
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Compra Ahora!
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para ver más productos */}
          <div className="text-center mt-5">
            <Link to="/productos" className="btn btn-outline-primary btn-lg px-5">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* =================== [SECCIÓN SERVICIOS] =================== */}
      <section id="services" className="services section">
        <div className="container section-title">
          <h2>Nuestros Servicios</h2>
          <p>En Visso Óptica ofrecemos una gama completa de servicios para el cuidado de tu salud visual:</p>
        </div>
        <div className="container">
          <div className="row gy-4 justify-content-center">
            
            {/* CARD 1: Lentes Oftálmicos -> "Opticos" */}
            <div className="col-xl-3 col-md-6 d-flex">
              <div 
                className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card"
                onClick={() => goToCategory('Opticos')} // CORREGIDO SEGÚN TU IMAGEN
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-eyeglasses service-icon-blue" />
                <h4 className="about-title mt-3">Lentes oftálmicos personalizados</h4>
                <p>Soluciones ópticas a medida para cada necesidad visual.</p>
              </div>
            </div>

            {/* CARD 2: Gafas de Sol -> "Lentes de sol" */}
            <div className="col-xl-3 col-md-6 d-flex">
              <div 
                className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card"
                onClick={() => goToCategory('Lentes de sol')} // CORREGIDO SEGÚN TU IMAGEN
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-sunglasses service-icon-blue" />
                <h4 className="about-title mt-3">Gafas de sol de diseñador</h4>
                <p>Estilo y protección con las mejores marcas internacionales.</p>
              </div>
            </div>

            {/* CARD 3: Lentes de Contacto -> "Lentes de contacto" */}
            <div className="col-xl-3 col-md-6 d-flex">
              <div 
                className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card"
                onClick={() => goToCategory('Lentes de contacto')} // CORREGIDO SEGÚN TU IMAGEN
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-droplet service-icon-blue" />
                <h4 className="about-title mt-3">Lentes de contacto</h4>
                <p>Comodidad y visión clara con lentes de contacto de última generación.</p>
              </div>
            </div>

            {/* CARD 4: Accesorios -> "Accesorios" */}
            <div className="col-xl-3 col-md-6 d-flex">
              <div 
                className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card"
                onClick={() => goToCategory('Accesorios')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-bag service-icon-blue" />
                <h4 className="about-title mt-3">Accesorios</h4>
                <p>Complementos esenciales para el cuidado y protección de tus lentes.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================== [SECCIÓN SOBRE NOSOTROS] =================== */}
      <Nosotros />

      {/* =================== [SECCIÓN CONTACTO] =================== */}
      <Contacto />

    </main>
  );
}

export default Home;