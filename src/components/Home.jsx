import React, { useCallback } from 'react';
import images from '../assets/js/images';
import { Link } from 'react-router-dom';
import { validarEmail, validarTelefonoChile, setFieldError, formatearTelefonoChile } from '../assets/js/validaciones';

function Home() {
  const onSubmitContacto = useCallback((e) => {
    if (!e || !e.preventDefault) return;
    e.preventDefault();
    const form = e.target;
    const nombre = form.querySelector('#nombre');
    const email = form.querySelector('#email');
    const telefono = form.querySelector('#telefono');
    const asunto = form.querySelector('#asunto');
    const mensaje = form.querySelector('#mensaje');

    const nombreError = form.querySelector('#nombreError');
    const emailError = form.querySelector('#emailError');
    const telefonoError = form.querySelector('#telefonoError');
    const asuntoError = form.querySelector('#asuntoError');
    const mensajeError = form.querySelector('#mensajeError');
    const successMessage = form.querySelector('#successMessage');

    // Reset
    [nombreError, emailError, telefonoError, asuntoError, mensajeError].forEach(el => el && (el.style.display = 'none'));
    if (successMessage) successMessage.style.display = 'none';

    let ok = true;
    if (!nombre.value.trim()) { setFieldError(nombre, nombreError, 'Por favor ingresa tu nombre completo'); ok = false; } else { setFieldError(nombre, nombreError, ''); }
    if (!validarEmail(email.value)) { setFieldError(email, emailError, 'Por favor ingresa un correo válido'); ok = false; } else { setFieldError(email, emailError, ''); }
    // Formatear y validar teléfono chileno 9 1234 5678
    if (telefono.value) {
      telefono.value = formatearTelefonoChile(telefono.value);
    }
    if (!validarTelefonoChile(telefono.value)) { setFieldError(telefono, telefonoError, 'El formato es 9 1234 5678'); ok = false; } else { setFieldError(telefono, telefonoError, ''); }
    if (!asunto.value) { setFieldError(asunto, asuntoError, 'Por favor selecciona un asunto'); ok = false; } else { setFieldError(asunto, asuntoError, ''); }
    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) { setFieldError(mensaje, mensajeError, 'Por favor ingresa tu mensaje (mínimo 10 caracteres)'); ok = false; } else { setFieldError(mensaje, mensajeError, ''); }

    if (!ok) return;
    form.reset();
    if (successMessage) {
      successMessage.style.display = 'block';
      setTimeout(() => { successMessage.style.display = 'none'; }, 4000);
    }
  }, []);
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
            <Link to="/productos" className="btn-get-started">Ver Productos</Link>
          </div>
        </div>
        <div className="col-lg-6 order-1 order-lg-2 hero-img">
          <img src={images.demo} className="img-fluid animated" alt="Gafas modernas" />
        </div>
      </div>
    </div>
  </section>
  {/* =================== [SECCIÓN SOBRE NOSOTROS] =================== */}
  <section id="about" className="about section">
    <div className="container section-title">
      <h2>Sobre Visso Óptica</h2>
      <p>Con más de 15 años de experiencia en el sector óptico, nos hemos consolidado como una de las ópticas más confiables y profesionales de la región.</p>
    </div>
    <div className="container">
      <div className="row gy-5 align-items-center aboutus-structure">
        <div className="col-lg-7">
          <div className="aboutus-textblock">
            <h3 className="aboutus-title text-lg-start text-center">Atención personalizada y soluciones visuales</h3>
            <p className="aboutus-desc text-lg-start text-center">Nuestro equipo de optometristas certificados está comprometido con brindar una atención personalizada y encontrar la solución visual perfecta para cada cliente.<br /><br />
              En Visso Óptica, creemos que la visión es una parte fundamental de tu bienestar. Por eso, trabajamos con tecnología de punta y un trato humano excepcional para que cada visita sea una experiencia única.<br /><br />
              <span className="aboutus-highlight">¡Más de 5,000 clientes satisfechos nos respaldan!</span></p>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="aboutus-datos d-flex flex-lg-column flex-row justify-content-center align-items-center gap-4">
            <div className="text-center">
              <i className="bi bi-emoji-smile aboutus-icon-blue" />
              <h4 className="mb-0 about-highlight aboutus-number">+5,000</h4>
              <small className="aboutus-label">Clientes Satisfechos</small>
            </div>
            <div className="text-center">
              <i className="bi bi-star-fill aboutus-icon-yellow" />
              <h4 className="mb-0 about-highlight aboutus-number">4.9/5</h4>
              <small className="aboutus-label">Calificación</small>
            </div>
          </div>
        </div>
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
        <div className="col-xl-4 col-md-6 d-flex">
          <div className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card">
            <i className="bi bi-eyeglasses service-icon-blue" />
            <h4 className="about-title mt-3">Lentes oftálmicos personalizados</h4>
            <p>Soluciones ópticas a medida para cada necesidad visual.</p>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 d-flex">
          <div className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card">
            <i className="bi bi-sunglasses service-icon-blue" />
            <h4 className="about-title mt-3">Gafas de sol de diseñador</h4>
            <p>Estilo y protección con las mejores marcas internacionales.</p>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 d-flex">
          <div className="service-item position-relative text-center p-4 h-100 shadow-sm border-0 about-card">
            <i className="bi bi-droplet service-icon-blue" />
            <h4 className="about-title mt-3">Lentes de contacto</h4>
            <p>Comodidad y visión clara con lentes de contacto de última generación.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* =================== [SECCIÓN TIENDA] =================== */}
  <section id="tienda" className="tienda section">
    <div className="container section-title">
      <h2>Tienda</h2>
      <p>Descubre algunos de nuestros productos destacados. ¡Explora la tienda para ver más!</p>
    </div>
    <div className="container">
  <div id="tiendaCarousel" className="carousel slide" data-bs-interval="false" data-bs-touch="true" data-bs-keyboard="true">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#tiendaCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1" />
          <button type="button" data-bs-target="#tiendaCarousel" data-bs-slide-to="1" aria-label="Slide 2" />
          <button type="button" data-bs-target="#tiendaCarousel" data-bs-slide-to="2" aria-label="Slide 3" />
          <button type="button" data-bs-target="#tiendaCarousel" data-bs-slide-to="3" aria-label="Slide 4" />

        </div>
        <div className="carousel-inner tienda-carousel-inner">
          <div className="carousel-item active">
            <div className="product-card text-center p-4 h-100 shadow-sm border-0">
              <img src={images['1']} className="img-fluid mb-3 rounded d-block mx-auto" alt="Lentes de sol modelo A" />
              <h5 className="mb-1">Lentes de Sol Modelo A</h5>
              <p className="text-muted mb-2">Diseño moderno y protección UV400</p>
              <span className="text-primary">$39.990</span>
            </div>
          </div>
          <div className="carousel-item"> 
            <div className="product-card text-center p-4 h-100 shadow-sm border-0">
              <img src={images['2']} className="img-fluid mb-3 rounded d-block mx-auto" alt="Lentes ópticos modelo B" />
              <h5 className="mb-1">Lentes Ópticos Modelo B</h5>
              <p className="text-muted mb-2">Armazón ligero y resistente</p>
              <span className="text-primary">$39.500</span>
            </div>
          </div>
          <div className="carousel-item">
            <div className="product-card text-center p-4 h-100 shadow-sm border-0">
              <img src={images['3']} className="img-fluid mb-3 rounded d-block mx-auto" alt="Lentes de contacto premium" />
              <h5 className="mb-1">Lentes de Ópticos Premium</h5>
              <p className="text-muted mb-2">Comodidad y visión clara todo el día</p>
              <span className="text-primary">$30.000</span>
            </div>
          </div>
          <div className="carousel-item">
            <div className="product-card text-center p-4 h-100 shadow-sm border-0">
              <img src={images['4']} className="img-fluid mb-3 rounded d-block mx-auto" alt="Gafas de lectura Classic" />
              <h5 className="mb-1">Gafas de Lectura Classic</h5>
              <p className="text-muted mb-2">Estilo clásico y gran comodidad</p>
              <span className="text-primary">$50.000</span>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#tiendaCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#tiendaCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
      <div className="text-center mt-4">
        <Link to="/productos" className="btn-getstarted d-flex align-items-center gap-1 justify-content-center mx-auto tienda-cta">
          <i className="bi bi-shop" /> Ir a tienda
        </Link>
      </div>
    </div>
  </section>
  {/* =================== [SECCIÓN CONTACTO / FORMULARIO] =================== */}
  <section id="contacto" className="contact-section section-padding">
    <div className="container">
      <div className="row text-center mb-5">
        <div className="col-lg-8 mx-auto">
          <h2 className="display-5 fw-bold mb-3">Contáctanos</h2>
          <p className="lead text-muted">¿Tienes alguna pregunta? Estamos aquí para ayudarte</p>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="contact-form">
            <form id="contactForm" noValidate onSubmit={onSubmitContacto}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre Completo *</label>
                  <input type="text" className="form-control" id="nombre" name="nombre" required />
                  <div className="error-message" id="nombreError">Por favor ingresa tu nombre completo</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Correo Electrónico *</label>
                  <input type="email" className="form-control" id="email" name="email" required placeholder="correo@ejemplo.com" />
                  <div className="error-message" id="emailError">Por favor ingresa un correo válido</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input type="tel" className="form-control" id="telefono" name="telefono" placeholder="9 1234 5678" />
                  <div className="error-message" id="telefonoError">Por favor ingresa un teléfono válido</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="asunto" className="form-label">Asunto *</label>
                  <select className="form-control" id="asunto" name="asunto" required>
                    <option value>Seleccionar asunto</option>
                    <option value="consulta">Consulta General</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                  </select>
                  <div className="error-message" id="asuntoError">Por favor selecciona un asunto</div>
                </div>
                <div className="col-12">
                  <label htmlFor="mensaje" className="form-label">Mensaje *</label>
                  <textarea className="form-control" id="mensaje" name="mensaje" rows={5} required placeholder="Escribe tu mensaje aquí..." defaultValue={""} />
                  <div className="error-message" id="mensajeError">Por favor ingresa tu mensaje (mínimo 10 caracteres)</div>
                </div>
                <div className="col-12 text-center">
                  <button type="submit" className="btn btn-submit btn-lg">
                    <i className="fas fa-paper-plane me-2" />Enviar Mensaje
                  </button>
                  <div className="success-message" id="successMessage">
                    <i className="fas fa-check-circle me-2" />¡Mensaje enviado exitosamente! Te contactaremos pronto.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>


  );
}

export default Home;