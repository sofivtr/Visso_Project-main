import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación entre páginas

const Nosotros = () => {
  return (
    <section id="about" className="about-modern-section light-background" style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="row align-items-center">
          
          {/* COLUMNA 1: IMAGEN -> Lleva a la PÁGINA de Contacto (/contacto) */}
          <div className="col-lg-6" data-aos="fade-right">
            <div className="about-img-wrapper" style={{ cursor: 'pointer' }}>
              <Link to="/contacto" title="Ir a la página de Contacto">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Nuestro Equipo trabajando" 
                  className="about-main-img" 
                />
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: TEXTO Y TARJETAS */}
          <div className="col-lg-6 about-content" data-aos="fade-left">
            
            <div className="section-title" style={{ textAlign: 'left', marginBottom: '20px', paddingBottom: '0' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', position: 'relative' }}>Sobre Nosotros</h2>
            </div>

            <h3 style={{ fontSize: '26px', fontWeight: '400', color: '#555', marginTop: '10px' }}>
              Impulsando el futuro visual
            </h3>
            
            <p className="lead fst-italic text-secondary" style={{ fontSize: '16px' }}>
              En Visso, nos dedicamos a transformar tu salud visual con la mejor tecnología y atención del mercado.
            </p>
            <p style={{ fontSize: '15px' }}>
              Desde nuestros inicios, hemos buscado la excelencia. Nuestro equipo trabaja incansablemente para asegurar que tu experiencia sea única, combinando marcos de diseño moderno con cristales de alta precisión.
            </p>

            {/* GRID DE TARJETAS */}
            <div className="feature-grid">
              
              {/* TARJETA 1: Calidad Certificada -> Lleva a la PÁGINA de Productos (/productos) */}
              <Link 
                to="/productos"
                className="feature-card"
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'block', 
                  cursor: 'pointer' 
                }}
              >
                <i className="bi bi-award"></i> 
                <h5>Calidad Certificada</h5>
                <p>Ver catálogo de productos</p>
              </Link>

              {/* TARJETA 2: Soporte 24/7 -> Lleva a la PÁGINA de Contacto (/contacto) */}
              <Link 
                to="/contacto" 
                className="feature-card"
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'block', 
                  cursor: 'pointer' 
                }}
              >
                <i className="bi bi-clock-history"></i>
                <h5>Soporte 24/7</h5>
                <p>Ir a formulario de contacto</p>
              </Link>

            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;