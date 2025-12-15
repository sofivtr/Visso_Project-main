import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { validarRut, validarEmail, validarTelefonoChile, formatearRut, formatearTelefonoChile, setFieldError } from '../assets/js/validaciones';
import { Api } from '../assets/js/api';
import { getImageUrl } from '../assets/js/imageUtils';
import { getCurrentUser } from '../assets/js/session';
import { clearCart } from '../assets/js/carrito';

function Carrito() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regiones, setRegiones] = useState([]); 
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [yaPreLlenado, setYaPreLlenado] = useState(false);
  const usuario = getCurrentUser();

  // Estados del formulario de pago
  const [formPago, setFormPago] = useState({
    nombreContacto: '',
    telefono: '',
    email: '',
    region: '',
    comuna: '',
    direccion: '',
    tipoEntrega: 'DESPACHO',
    tipoPago: 'DEBITO',
    numeroTarjeta: ''
  });

  // Cargar regiones y pre-llenar datos del usuario
  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        const data = await Api.regionesComunas();
        setRegiones(data.regiones || []);
      } catch (error) {
        console.error('Error al cargar regiones:', error);
      }
    };
    cargarRegiones();
  }, []); // Solo ejecutar una vez al montar

  useEffect(() => {
    if (usuario && !yaPreLlenado) {
      // Solo pre-llenar una vez al cargar el componente
      setFormPago(prev => ({
        ...prev,
        nombreContacto: usuario.nombre && usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre || '',
        email: usuario.email || ''
      }));
      setYaPreLlenado(true);
    }
  }, [usuario, yaPreLlenado]); // Solo cuando cambia el usuario y no se ha pre-llenado

  // Cargar carrito desde el backend
  useEffect(() => {
    if (!usuario || !usuario.id) {
      setLoading(false);
      return;
    }
    
    const cargarCarrito = async () => {
      try {
        const data = await Api.getCarrito(usuario.id);
        setCarrito(data);
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        setCarrito(null);
      } finally {
        setLoading(false);
      }
    };

    cargarCarrito();
  }, [usuario]);

  const items = carrito?.detalles || [];
  
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => {
      const precio = item.cotizacion?.valorAprox || item.precioUnitario || 0;
      return sum + (precio * item.cantidad);
    }, 0);
    
    const iva = subtotal * 0.19;
    const envio = subtotal > 50000 ? 0 : 3000;
    const total = subtotal + iva + envio;
    
    return { subtotal, iva, envio, total };
  };

  const totals = calcularTotales();
  const fmt = (n) => `$${(n || 0).toLocaleString('es-CL')}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para teléfono, formatear automáticamente usando función de validaciones.js
    if (name === 'telefono') {
      const telefonoLimpio = value.replace(/[^0-9]/g, '');
      // Formatear si empieza con 9 y tiene suficientes dígitos
      const telefonoFormateado = telefonoLimpio.startsWith('9') && telefonoLimpio.length >= 5 
        ? formatearTelefonoChile(telefonoLimpio)
        : telefonoLimpio;
      
      setFormPago(prev => ({
        ...prev,
        [name]: telefonoFormateado
      }));
      return;
    }
    
    // Para número de tarjeta, solo números y espacios, máximo 19 caracteres
    if (name === 'numeroTarjeta') {
      const numeroLimpio = value.replace(/[^0-9]/g, '');
      if (numeroLimpio.length <= 16) {
        // Formatear con espacios cada 4 dígitos
        const numeroFormateado = numeroLimpio.match(/.{1,4}/g)?.join(' ') || numeroLimpio;
        setFormPago(prev => ({
          ...prev,
          [name]: numeroFormateado
        }));
      }
      return;
    }
    
    setFormPago(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoEntregaChange = (tipo) => {
    setFormPago(prev => ({
      ...prev,
      tipoEntrega: tipo,
      // Limpiar campos de dirección si se elige RETIRO
      ...(tipo === 'RETIRO' ? {
        region: '',
        comuna: '',
        direccion: ''
      } : {})
    }));
  };

  const validarFormulario = () => {
    // Obtener referencias de los campos
    const nombreInput = document.querySelector('[name="nombreContacto"]');
    const emailInput = document.querySelector('[name="email"]');
    const telefonoInput = document.querySelector('[name="telefono"]');
    const regionSelect = document.querySelector('[name="region"]');
    const comunaSelect = document.querySelector('[name="comuna"]');
    const direccionInput = document.querySelector('[name="direccion"]');
    const numeroTarjetaInput = document.querySelector('[name="numeroTarjeta"]');

    // Obtener referencias de los mensajes de error
    const nombreError = document.getElementById('nombreContactoError');
    const emailError = document.getElementById('emailError');
    const telefonoError = document.getElementById('telefonoError');
    const regionError = document.getElementById('regionError');
    const comunaError = document.getElementById('comunaError');
    const direccionError = document.getElementById('direccionError');
    const numeroTarjetaError = document.getElementById('numeroTarjetaError');

    let ok = true;

    // Limpiar errores previos
    setFieldError(nombreInput, nombreError, '');
    setFieldError(emailInput, emailError, '');
    setFieldError(telefonoInput, telefonoError, '');
    setFieldError(regionSelect, regionError, '');
    setFieldError(comunaSelect, comunaError, '');
    setFieldError(direccionInput, direccionError, '');
    setFieldError(numeroTarjetaInput, numeroTarjetaError, '');

    // Validar nombre
    if (!formPago.nombreContacto.trim()) {
      setFieldError(nombreInput, nombreError, 'Por favor ingresa tu nombre completo');
      ok = false;
    } else if (formPago.nombreContacto.trim().length < 3) {
      setFieldError(nombreInput, nombreError, 'El nombre debe tener al menos 3 caracteres');
      ok = false;
    }

    // Validar email
    if (!formPago.email.trim()) {
      setFieldError(emailInput, emailError, 'Por favor ingresa tu email');
      ok = false;
    } else if (!validarEmail(formPago.email)) {
      setFieldError(emailInput, emailError, 'Por favor ingresa un email válido');
      ok = false;
    }

    // Validar teléfono
    if (!formPago.telefono.trim()) {
      setFieldError(telefonoInput, telefonoError, 'Por favor ingresa tu teléfono');
      ok = false;
    } else if (!validarTelefonoChile(formPago.telefono)) {
      setFieldError(telefonoInput, telefonoError, 'Por favor ingresa un teléfono válido (formato: 9 1234 5678)');
      ok = false;
    }

    // Validar dirección si es DESPACHO
    if (formPago.tipoEntrega === 'DESPACHO') {
      if (!formPago.region) {
        setFieldError(regionSelect, regionError, 'Por favor selecciona una región');
        ok = false;
      }
      if (!formPago.comuna) {
        setFieldError(comunaSelect, comunaError, 'Por favor selecciona una comuna');
        ok = false;
      }
      if (!formPago.direccion.trim()) {
        setFieldError(direccionInput, direccionError, 'Por favor ingresa tu dirección completa');
        ok = false;
      } else if (formPago.direccion.trim().length < 5) {
        setFieldError(direccionInput, direccionError, 'La dirección debe ser más específica');
        ok = false;
      }
    }

    // Validar número de tarjeta
    if (!formPago.numeroTarjeta.trim()) {
      setFieldError(numeroTarjetaInput, numeroTarjetaError, 'Por favor ingresa el número de tarjeta');
      ok = false;
    } else {
      const numeroLimpio = formPago.numeroTarjeta.replace(/[^0-9]/g, '');
      if (numeroLimpio.length < 13 || numeroLimpio.length > 16) {
        setFieldError(numeroTarjetaInput, numeroTarjetaError, 'El número de tarjeta debe tener entre 13 y 16 dígitos');
        ok = false;
      }
    }

    return ok;
  };

  const finalizarCompra = async () => {
    if (!validarFormulario()) return;
    if (procesandoPago) return;

    setProcesandoPago(true);

    try {
      const numeroTarjetaLimpio = formPago.numeroTarjeta.replace(/[^0-9]/g, '');
      const datosTransaccion = {
        nombreContacto: formPago.nombreContacto.trim(),
        telefono: formPago.telefono.trim(),
        email: formPago.email.trim().toLowerCase(),
        region: formPago.tipoEntrega === 'DESPACHO' ? formPago.region : 'N/A',
        comuna: formPago.tipoEntrega === 'DESPACHO' ? formPago.comuna : 'N/A',
        direccion: formPago.tipoEntrega === 'DESPACHO' ? formPago.direccion.trim() : 'Retiro en tienda',
        tipoEntrega: formPago.tipoEntrega,
        tipoPago: formPago.tipoPago,
        infoTarjeta: `**** ${numeroTarjetaLimpio.slice(-4)}`
      };

      await Api.cerrarCarrito(usuario.id, datosTransaccion);
      clearCart();

      // Guardar datos en sessionStorage para la página de resultado
      const pedidoCompleto = {
        usuario: {
          rut: usuario.rut,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido
        },
        datosTransaccion: datosTransaccion,
        carrito: carrito,
        totales: {
          subtotal: totals.subtotal,
          iva: totals.iva,
          envio: totals.envio,
          total: totals.total
        }
      };
      sessionStorage.setItem('ultimo_pedido', JSON.stringify(pedidoCompleto));

      // Cerrar el modal correctamente y remover el backdrop
      const modalEl = document.getElementById('checkoutModal');
      const modal = window.bootstrap?.Modal?.getInstance(modalEl);
      
      if (modal) {
        modal.hide();
      }
      
      // Remover manualmente el backdrop y clases del body
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');

      // Navegar después de un pequeño delay para asegurar que el modal se cerró
      setTimeout(() => {
        navigate('/resultado-compra?estado=ok');
      }, 100);
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      alert('❌ Error al procesar la compra: ' + (error.response?.data?.mensaje || error.message));
      
      // En caso de error, también limpiar el modal
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    } finally {
      setProcesandoPago(false);
    }
  };

  const eliminarItem = async (detalleId) => {
    try {
      await Api.removeFromCarrito(detalleId);
      // Recargar carrito desde backend
      const nuevoCarrito = await Api.getCarrito(usuario.id);
      setCarrito(nuevoCarrito);
      
      // Actualizar localStorage para sincronizar el contador
      const itemsLS = (nuevoCarrito?.detalles || []).map(item => ({
        id: item.producto?.id || item.id,
        nombre: item.nombreProducto,
        precio: item.cotizacion?.valorAprox || item.precioUnitario,
        cantidad: item.cantidad,
        imagenUrl: item.producto?.imagenUrl || ''
      }));
      localStorage.setItem('carrito', JSON.stringify(itemsLS));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error al eliminar item:', error);
      alert('Error al eliminar el producto');
    }
  };

  const actualizarCantidad = async (detalleId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    try {
      await Api.updateCarritoItem(detalleId, nuevaCantidad);
      // Recargar carrito desde backend
      const nuevoCarrito = await Api.getCarrito(usuario.id);
      setCarrito(nuevoCarrito);
      
      // Actualizar localStorage para sincronizar el contador
      const itemsLS = (nuevoCarrito?.detalles || []).map(item => ({
        id: item.producto?.id || item.id,
        nombre: item.nombreProducto,
        precio: item.cotizacion?.valorAprox || item.precioUnitario,
        cantidad: item.cantidad,
        imagenUrl: item.producto?.imagenUrl || ''
      }));
      localStorage.setItem('carrito', JSON.stringify(itemsLS));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      const mensaje = error.response?.data?.message || error.message;
      if (error.response?.status === 400 && (mensaje.toLowerCase().includes('stock') || mensaje.toLowerCase().includes('disponible'))) {
        alert(mensaje);
        // Recargar carrito para mostrar cantidad correcta
        const nuevoCarrito = await Api.getCarrito(usuario.id);
        setCarrito(nuevoCarrito);
      } else {
        alert('Error al actualizar la cantidad: ' + mensaje);
      }
    }
  };



  if (!usuario) {
    return (
      <main className="main">
        <section className="page-header">
          <div className="container">
            <h1 className="fw-bold mb-3">Carrito de Compras</h1>
            <p className="lead">Debe iniciar sesión para ver su carrito</p>
            <Link to="/auth" className="btn btn-primary">Iniciar Sesión</Link>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="main">
        <div className="container py-5 text-center">
          <p>Cargando carrito...</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="main">
        <section className="page-header">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <h1 className="fw-bold mb-3" id="titulo_carrito">Carrito de Compras</h1>
                <p className="lead mb-0">Revisa y confirma tu selección antes de proceder al pago</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link to="/productos" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i> Continuar Comprando
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i> Tu carrito está vacío. <Link to="/productos">Explora productos</Link>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    {items.map((item) => {
                      const precio = item.cotizacion?.valorAprox || item.precioUnitario || 0;
                      const producto = item.producto;
                      
                      return (
                        <div key={item.id} className="cart-item border-bottom pb-3 mb-3">
                          <div className="row align-items-center">
                            <div className="col-md-2">
                              <img
                                src={getImageUrl(producto?.imagenUrl)}
                                alt={item.nombreProducto}
                                className="img-fluid rounded"
                              />
                            </div>
                            <div className="col-md-4">
                              <h5 className="mb-1">{item.nombreProducto}</h5>
                              <small className="text-muted">{producto?.categoria?.nombre || ''}</small>
                              
                              {/* Mostrar información de cotización */}
                              {item.cotizacion && (
                                <div className="mt-2 p-2 bg-light rounded">
                                  <small className="d-block fw-bold text-primary">
                                    <i className="bi bi-clipboard-data me-1"></i>
                                    Cotización Personalizada
                                  </small>
                                  <small className="d-block">
                                    <strong>Paciente:</strong> {item.cotizacion.nombrePaciente}
                                  </small>
                                  {item.cotizacion.gradoOd && (
                                    <small className="d-block">
                                      <strong>OD:</strong> {item.cotizacion.gradoOd} | <strong>OI:</strong> {item.cotizacion.gradoOi}
                                    </small>
                                  )}
                                  <small className="d-block">
                                    <strong>Tipo:</strong> {item.cotizacion.tipoLente} - {item.cotizacion.tipoCristal}
                                  </small>
                                  {(item.cotizacion.antirreflejo || item.cotizacion.filtroAzul) && (
                                    <small className="d-block">
                                      <strong>Tratamientos:</strong>{' '}
                                      {item.cotizacion.antirreflejo && 'Antirreflejo '}
                                      {item.cotizacion.filtroAzul && 'Filtro Azul'}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="col-md-2 text-center">
                              <p className="fw-bold mb-0">{fmt(precio)}</p>
                              <small className="text-muted">c/u</small>
                            </div>
                            <div className="col-md-2">
                              <div className="input-group">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                  disabled={item.cantidad <= 1}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={item.cantidad}
                                  readOnly
                                  style={{ maxWidth: 60 }}
                                />
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                  disabled={item.cantidad >= (item.producto?.stock || 0)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="col-md-2 text-end">
                              <p className="fw-bold mb-2">{fmt(precio * item.cantidad)}</p>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarItem(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Resumen de la Compra</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{fmt(totals.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Envío:</span>
                      <span>{totals.envio === 0 ? 'Gratis' : fmt(totals.envio)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>IVA (19%):</span>
                      <span>{fmt(totals.iva)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong className="text-primary">{fmt(totals.total)}</strong>
                    </div>
                    <button
                      className="btn btn-primary w-100"
                      data-bs-toggle="modal"
                      data-bs-target="#checkoutModal"
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Proceder al Pago
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Finalizar Compra */}
      <div className="modal fade" id="checkoutModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title"><i className="bi bi-credit-card me-2"></i>Finalizar Compra</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {/* Sección de Contacto */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2"><i className="bi bi-person-fill me-2"></i>Datos de Contacto</h6>
                <p className="text-muted small mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Estos son los datos de la persona que recibirá el pedido (despacho a domicilio) o lo retirará en tienda.
                </p>
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="nombreContacto"
                      value={formPago.nombreContacto}
                      onChange={handleInputChange}
                      required 
                    />
                    <div id="nombreContactoError" className="error-message text-danger small" style={{display: 'none'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formPago.email}
                      onChange={handleInputChange}
                      required 
                    />
                    <div id="emailError" className="error-message text-danger small" style={{display: 'none'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="telefono"
                      placeholder="9 1234 5678"
                      value={formPago.telefono}
                      onChange={handleInputChange}
                      required 
                    />
                    <div id="telefonoError" className="error-message text-danger small" style={{display: 'none'}} />
                  </div>
                </div>
              </div>

              {/* Sección de Entrega */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3"><i className="bi bi-truck me-2"></i>Tipo de Entrega</h6>
                <div className="d-flex gap-3 mb-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="tipoEntrega" 
                      id="retiro"
                      checked={formPago.tipoEntrega === 'RETIRO'}
                      onChange={() => handleTipoEntregaChange('RETIRO')}
                    />
                    <label className="form-check-label" htmlFor="retiro">
                      <i className="bi bi-shop me-1"></i>Retiro en Tienda
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="tipoEntrega" 
                      id="despacho"
                      checked={formPago.tipoEntrega === 'DESPACHO'}
                      onChange={() => handleTipoEntregaChange('DESPACHO')}
                    />
                    <label className="form-check-label" htmlFor="despacho">
                      <i className="bi bi-house-door me-1"></i>Despacho a Domicilio
                    </label>
                  </div>
                </div>

                {formPago.tipoEntrega === 'DESPACHO' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Región</label>
                      <select 
                        className="form-select" 
                        name="region"
                        value={formPago.region}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar región</option>
                        {regiones.map(r => (
                          <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                      </select>
                      <div id="regionError" className="error-message text-danger small" style={{display: 'none'}} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Comuna</label>
                      <select 
                        className="form-select" 
                        name="comuna"
                        value={formPago.comuna}
                        onChange={handleInputChange}
                        required
                        disabled={!formPago.region}
                      >
                        <option value="">Seleccionar comuna</option>
                        {formPago.region && regiones.find(r => r.region === formPago.region)?.comunas.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div id="comunaError" className="error-message text-danger small" style={{display: 'none'}} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Dirección</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="direccion"
                        placeholder="Calle, Número, Depto/Casa"
                        value={formPago.direccion}
                        onChange={handleInputChange}
                        required 
                      />
                      <div id="direccionError" className="error-message text-danger small" style={{display: 'none'}} />
                    </div>
                  </div>
                )}

                {formPago.tipoEntrega === 'RETIRO' && (
                  <div className="alert alert-info mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Dirección de retiro:</strong> Antonio Varas 666, Providencia, Santiago
                  </div>
                )}
              </div>

              {/* Sección de Pago */}
              <div className="mb-3">
                <h6 className="fw-bold mb-3"><i className="bi bi-wallet2 me-2"></i>Medio de Pago</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tipo de Tarjeta</label>
                    <select 
                      className="form-select" 
                      name="tipoPago"
                      value={formPago.tipoPago}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="DEBITO">Débito</option>
                      <option value="CREDITO">Crédito</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Número de Tarjeta</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="numeroTarjeta"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={formPago.numeroTarjeta}
                      onChange={handleInputChange}
                      required 
                    />
                    <div id="numeroTarjetaError" className="error-message text-danger small" style={{display: 'none'}} />
                    <small className="text-muted">Solo simulación, no se procesa el pago real</small>
                  </div>
                </div>
              </div>

              {/* Resumen del Total */}
              <div className="alert alert-light border mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>{fmt(totals.subtotal)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <strong>{totals.envio === 0 ? 'Gratis' : fmt(totals.envio)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>IVA (19%):</span>
                  <strong>{fmt(totals.iva)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="h5 mb-0">Total:</span>
                  <span className="h5 mb-0 text-primary">{fmt(totals.total)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={finalizarCompra}
                disabled={procesandoPago}
              >
                {procesandoPago ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirmar Compra
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Carrito;
