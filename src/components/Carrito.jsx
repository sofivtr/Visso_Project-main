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
  const usuario = getCurrentUser();

  // Cargar regiones y comunas
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
  }, []);

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

  // Función para poblar regiones y comunas
  const poblarRegionesYComunas = () => {
    const regionSelect = document.getElementById('checkoutRegion');
    const comunaSelect = document.getElementById('checkoutComuna');
    
    if (!regionSelect || !comunaSelect || regiones.length === 0) return;

    // Guardar valor seleccionado
    const regionSeleccionada = regionSelect.value;
    const comunaSeleccionada = comunaSelect.value;

    // Poblar regiones
    regionSelect.innerHTML = '<option value="">Seleccionar región</option>';
    regiones.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.region;
      opt.textContent = r.region;
      if (r.region === regionSeleccionada) opt.selected = true;
      regionSelect.appendChild(opt);
    });

    // Poblar comunas si hay región seleccionada
    if (regionSeleccionada) {
      const region = regiones.find(r => r.region === regionSeleccionada);
      if (region && region.comunas) {
        comunaSelect.innerHTML = '<option value="">Seleccionar comuna</option>';
        region.comunas.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          if (c === comunaSeleccionada) opt.selected = true;
          comunaSelect.appendChild(opt);
        });
      }
    }

    // Agregar listener para cambio de región (solo una vez)
    if (!regionSelect.dataset.listenerAdded) {
      regionSelect.dataset.listenerAdded = 'true';
      regionSelect.addEventListener('change', (e) => {
        const region = regiones.find(r => r.region === e.target.value);
        comunaSelect.innerHTML = '<option value="">Seleccionar comuna</option>';
        if (region && region.comunas) {
          region.comunas.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            comunaSelect.appendChild(opt);
          });
        }
      });
    }
  };

  // Ejecutar cuando se abre el modal
  useEffect(() => {
    const modal = document.getElementById('checkoutModal');
    if (modal && regiones.length > 0) {
      const handler = () => {
        setTimeout(poblarRegionesYComunas, 100);
      };
      modal.addEventListener('shown.bs.modal', handler);
      return () => {
        modal.removeEventListener('shown.bs.modal', handler);
      };
    }
  }, [regiones]);

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

  const validarCheckout = () => {
    const nombre = document.getElementById('checkoutNombre');
    const rut = document.getElementById('checkoutRut');
    const email = document.getElementById('checkoutEmail');
    const tel = document.getElementById('checkoutTelefono');
    const direccion = document.getElementById('checkoutDireccion');
    const comuna = document.getElementById('checkoutComuna');
    const region = document.getElementById('checkoutRegion');

    const nombreErr = document.getElementById('checkoutNombreError');
    const rutErr = document.getElementById('checkoutRutError');
    const emailErr = document.getElementById('checkoutEmailError');
    const telErr = document.getElementById('checkoutTelefonoError');
    const direccionErr = document.getElementById('checkoutDireccionError');
    const comunaErr = document.getElementById('checkoutComunaError');
    const regionErr = document.getElementById('checkoutRegionError');

    let ok = true;
    if (!nombre.value.trim()) { setFieldError(nombre, nombreErr, 'Ingrese su nombre completo'); ok = false; } else { setFieldError(nombre, nombreErr, ''); }
    if (rut.value) rut.value = formatearRut(rut.value);
    if (!validarRut(rut.value)) { setFieldError(rut, rutErr, 'RUT inválido'); ok = false; } else { setFieldError(rut, rutErr, ''); }
    if (!validarEmail(email.value)) { setFieldError(email, emailErr, 'Correo inválido'); ok = false; } else { setFieldError(email, emailErr, ''); }
    if (tel.value) tel.value = formatearTelefonoChile(tel.value);
    if (!validarTelefonoChile(tel.value)) { setFieldError(tel, telErr, 'Formato esperado: 9 1234 5678'); ok = false; } else { setFieldError(tel, telErr, ''); }  
    if (!direccion.value.trim()) { setFieldError(direccion, direccionErr, 'Ingrese la dirección'); ok = false; } else { setFieldError(direccion, direccionErr, ''); } 
    if (!region.value) { setFieldError(region, regionErr, 'Seleccione una región'); ok = false; } else { setFieldError(region, regionErr, ''); } 
    if (!comuna.value) { setFieldError(comuna, comunaErr, 'Seleccione una comuna'); ok = false; } else { setFieldError(comuna, comunaErr, ''); }

    return ok;
  };

  const finalizarCompra = async () => {
    if (!validarCheckout()) return;

    try {
      // Cerrar el carrito en el backend (cambia estado a completado)
      await Api.cerrarCarrito(usuario.id);
      
      // Limpiar carrito local
      clearCart();
      
      // Guardar datos para la página de resultado con el formato correcto
      const itemsFormateados = items.map(item => {
        const precio = item.cotizacion?.valorAprox || item.precioUnitario || 0;
        return {
          id: item.id,
          nombre: item.nombreProducto,
          precio: precio,
          cantidad: item.cantidad,
          imagenUrl: item.producto?.imagenUrl || '',
        };
      });
      
      const pedido = {
        numero: String(Date.now()).slice(-8),
        cliente: {
          nombre: document.getElementById('checkoutNombre')?.value || '',
          rut: document.getElementById('checkoutRut')?.value || '',
          email: document.getElementById('checkoutEmail')?.value || '',
        },
        direccion: {
          calle: document.getElementById('checkoutDireccion')?.value || '',
          region: document.getElementById('checkoutRegion')?.value || '',
          comuna: document.getElementById('checkoutComuna')?.value || '',
        },
        items: itemsFormateados,
        totales: totals,
      };
      sessionStorage.setItem('ultimo_pedido', JSON.stringify(pedido));
      
      // Cerrar modal
      const modalEl = document.getElementById('checkoutModal');
      if (modalEl) {
        const btnClose = modalEl.querySelector('.btn-close');
        if (btnClose) btnClose.click();
      }
      
      // Navegar a resultado exitoso
      navigate('/resultado?estado=ok');
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      const mensaje = error.response?.data?.message || error.message;
      if (error.response?.status === 400 && (mensaje.toLowerCase().includes('stock') || mensaje.toLowerCase().includes('disponible'))) {
        alert(mensaje);
        // Recargar carrito para actualizar cantidades disponibles
        const nuevoCarrito = await Api.getCarrito(usuario.id);
        setCarrito(nuevoCarrito);
      } else {
        alert('Error al procesar la compra: ' + mensaje);
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
                      onClick={() => setTimeout(poblarRegionesYComunas, 200)}
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

      {/* Modal de Checkout */}
      <div className="modal fade" id="checkoutModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Finalizar Compra</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form id="checkoutForm">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre Completo *</label>
                    <input type="text" className="form-control" id="checkoutNombre" required />
                    <div id="checkoutNombreError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">RUT *</label>
                    <input type="text" className="form-control" id="checkoutRut" placeholder="12.345.678-9" required />
                    <div id="checkoutRutError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" id="checkoutEmail" required />
                    <div id="checkoutEmailError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono *</label>
                    <input type="tel" className="form-control" id="checkoutTelefono" placeholder="9 1234 5678" required />
                    <div id="checkoutTelefonoError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Dirección *</label>
                    <input type="text" className="form-control" id="checkoutDireccion" required />
                    <div id="checkoutDireccionError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Región *</label>
                    <select className="form-select" id="checkoutRegion" required>
                      <option value="">Seleccionar región</option>
                    </select>
                    <div id="checkoutRegionError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Comuna *</label>
                    <select className="form-select" id="checkoutComuna" required>
                      <option value="">Seleccionar comuna</option>
                    </select>
                    <div id="checkoutComunaError" className="text-danger small" style={{ display: 'none' }}></div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-success" onClick={finalizarCompra}>
                <i className="bi bi-check-circle me-2"></i>
                Simular Compra Exitosa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Carrito;
