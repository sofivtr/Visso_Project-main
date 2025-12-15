import React, { useState, useEffect } from 'react';
import { Api } from '../assets/js/api';

const Contacto = () => {
  
  const phoneNumber = "+56 9 9291 3516"; 
  
  // Estado para controlar la visibilidad del mensaje flotante
  const [mensajeCopiado, setMensajeCopiado] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  
  const [enviando, setEnviando] = useState(false);

  // Autocompletar datos del usuario si está en sesión
  useEffect(() => {
    const userStr = localStorage.getItem('visso_current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          nombre: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.nombre || '',
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validar longitud del mensaje (máximo 1000 caracteres)
    if (name === 'mensaje' && value.length > 1000) {
      return; // No actualizar si excede el límite
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (enviando) return;
    
    // Validar longitud mínima del mensaje (al menos 10 caracteres)
    if (formData.mensaje.trim().length < 10) {
      alert('⚠️ El mensaje debe tener al menos 10 caracteres');
      return;
    }
    
    setEnviando(true);
    
    try {
      await Api.enviarMensaje({
        nombre: formData.nombre,
        email: formData.email,
        asunto: formData.asunto,
        mensaje: formData.mensaje
      });
      
      alert('✅ ¡Mensaje enviado con éxito!\n\nGracias por contactar a Visso. Te responderemos dentro de las próximas 24 horas.');
      
      // Limpiar solo mensaje y asunto, mantener nombre y email si hay sesión
      const userStr = localStorage.getItem('visso_current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setFormData({
          nombre: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.nombre || '',
          email: user.email || '',
          asunto: '',
          mensaje: ''
        });
      } else {
        setFormData({
          nombre: '',
          email: '',
          asunto: '',
          mensaje: ''
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('❌ Error al enviar el mensaje\n\nPor favor, intenta nuevamente o contáctanos directamente por email.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber)
      .then(() => {
        // 1. Mostramos el mensaje
        setMensajeCopiado(true);
        
        // 2. Lo ocultamos automáticamente después de 2 segundos (2000 ms)
        setTimeout(() => {
          setMensajeCopiado(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  return (
    <section id="contact" className="section contact-section" style={{ position: 'relative' }}>
      
      {/* MENSAJE FLOTANTE (TOAST) */}
      {/* Se renderiza solo si mensajeCopiado es true */}
      {mensajeCopiado && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // Centrado perfecto
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo oscuro semitransparente
          color: '#fff',
          padding: '15px 30px',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          pointerEvents: 'none', // Permite hacer clicks debajo aunque esté visible (opcional)
          transition: 'opacity 0.3s ease-in-out'
        }}>
          ¡Se copió al portapapeles!
        </div>
      )}

      <div className="container">
        
        <div className="section-title">
          <h2>Contáctanos</h2>
          <p>Estamos listos para resolver tus dudas</p>
        </div>

        <div className="contact-modern-wrapper">
          
          {/* Lado Izquierdo: Información */}
          <div className="contact-info-side">
            <div>
              <h3>Hablemos</h3>
              <p className="mb-5">Déjanos un mensaje y el equipo de Visso te responderá dentro de las próximas 24 horas.</p>
              
              {/* ITEM 1: UBICACIÓN */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Antonio+Varas+666,+7500961+Providencia,+Región+Metropolitana" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-info-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <i className="bi bi-geo-alt"></i>
                <div>
                  <h4>Ubicación</h4>
                  <p>Antonio Varas 666, Providencia</p>
                </div>
              </a>

              {/* ITEM 2: EMAIL */}
              <a 
                href="mailto:Servicio@Visso.cl" 
                className="contact-info-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <i className="bi bi-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>Servicio@Visso.cl</p>
                </div>
              </a>

              {/* ITEM 3: TELÉFONO */}
              <div 
                className="contact-info-item"
                onClick={handleCopyPhone}
                style={{ cursor: 'pointer', userSelect: 'none' }} // userSelect evita que se resalte el texto al hacer clic rápido
                title="Haz clic para copiar el número"
              >
                <i className="bi bi-phone"></i>
                <div>
                  <h4>Teléfono</h4>
                  <p>{phoneNumber}</p>
                  <small style={{ fontSize: '12px', opacity: 0.7 }}>(Clic para copiar)</small>
                </div>
              </div>

            </div>
          </div>

          {/* Lado Derecho: Formulario */}
          <div className="contact-form-side">
            <form onSubmit={handleSubmit} className="php-email-form">
              <div className="row">
                <div className="col-md-6 form-group-modern">
                  <label htmlFor="nombre">Tu Nombre</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    id="nombre"
                    className="input-modern" 
                    placeholder="Ej: Juan Pérez" 
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="col-md-6 form-group-modern">
                  <label htmlFor="email">Tu Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email"
                    className="input-modern" 
                    placeholder="tucorreo@ejemplo.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group-modern">
                <label htmlFor="asunto">Asunto</label>
                <select 
                  name="asunto" 
                  id="asunto"
                  className="input-modern" 
                  value={formData.asunto}
                  onChange={handleInputChange}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="Consulta General">Consulta General</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="form-group-modern">
                <label htmlFor="mensaje">
                  Mensaje 
                  <small style={{ marginLeft: '10px', opacity: 0.7 }}>({formData.mensaje.length}/1000 caracteres)</small>
                </label>
                <textarea 
                  name="mensaje" 
                  id="mensaje"
                  className="input-modern" 
                  rows="5"
                  placeholder="Escribe tu mensaje aquí (mínimo 10 caracteres)..."
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  minLength={10}
                  maxLength={1000}
                  required
                ></textarea>
              </div>

              <div className="text-center">
                <button 
                  type="submit" 
                  className="btn-modern-submit"
                  disabled={enviando}
                  style={{ opacity: enviando ? 0.6 : 1, cursor: enviando ? 'not-allowed' : 'pointer' }}
                >
                  {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contacto;