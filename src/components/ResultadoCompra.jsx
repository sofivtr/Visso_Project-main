import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getImageUrl } from '../assets/js/imageUtils';

function formatCLP(value) {
  try { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); } catch { return `$${value || 0}`; }
}

export default function ResultadoCompra() {
  const [params] = useSearchParams();
  const estado = params.get('estado') === 'ok' ? 'ok' : 'fail';
  
  let pedido = null;
  try { 
    pedido = JSON.parse(sessionStorage.getItem('ultimo_pedido') || 'null'); 
  } catch (e) {
    console.error('Error al leer pedido:', e);
  }

  const usuario = pedido?.usuario;
  const datosTransaccion = pedido?.datosTransaccion;
  const carrito = pedido?.carrito;
  const totales = pedido?.totales || { subtotal: 0, iva: 0, envio: 0, total: 0 };
  const items = carrito?.detalles || [];

  const encabezado = estado === 'ok'
    ? { titulo: '¡Compra realizada exitosamente!', clase: 'alert alert-success d-flex align-items-center', icono: 'bi bi-check-circle me-2' }
    : { titulo: 'No se pudo completar la compra', clase: 'alert alert-danger d-flex align-items-center', icono: 'bi bi-x-circle me-2' };

  if (!pedido) {
    return (
      <main className="main">
        <section className="section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10">
                <div className="card shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                    <h3 className="mt-3">No se encontró información de la compra</h3>
                    <p className="text-muted">Por favor, intenta realizar la compra nuevamente.</p>
                    <Link className="btn btn-primary mt-3" to="/carrito">
                      <i className="bi bi-cart me-2"></i>Ir al Carrito
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className={encabezado.clase} role="alert">
                    <i className={encabezado.icono} />
                    <div>{encabezado.titulo}</div>
                  </div>

                  {/* Información del Usuario Autenticado */}
                  <h6 className="fw-bold mb-3"><i className="bi bi-person-badge me-2"></i>Datos del Usuario (Cuenta autenticada)</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted">RUT del Usuario</label>
                      <input className="form-control" readOnly value={usuario?.rut || 'No disponible'} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Email del Usuario</label>
                      <input className="form-control" readOnly value={usuario?.email || ''} />
                    </div>
                  </div>

                  {/* Información de Contacto del Pedido */}
                  <h6 className="fw-bold mb-3"><i className="bi bi-person-fill me-2"></i>Datos de Contacto (Formulario de compra)</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label text-muted">Nombre de Contacto</label>
                      <input className="form-control" readOnly value={datosTransaccion?.nombreContacto || ''} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">Email de Contacto</label>
                      <input className="form-control" readOnly value={datosTransaccion?.email || ''} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">Teléfono</label>
                      <input className="form-control" readOnly value={datosTransaccion?.telefono || ''} />
                    </div>
                  </div>

                  {/* Información de Entrega */}
                  <h6 className="fw-bold mb-3"><i className="bi bi-truck me-2"></i>Información de Entrega</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-12">
                      <label className="form-label text-muted">Tipo de Entrega</label>
                      <input 
                        className="form-control" 
                        readOnly 
                        value={datosTransaccion?.tipoEntrega === 'RETIRO' ? '🏪 Retiro en Tienda' : '🚚 Despacho a Domicilio'} 
                      />
                    </div>
                    {datosTransaccion?.tipoEntrega === 'DESPACHO' && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label text-muted">Región</label>
                          <input className="form-control" readOnly value={datosTransaccion?.region || ''} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted">Comuna</label>
                          <input className="form-control" readOnly value={datosTransaccion?.comuna || ''} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted">Dirección</label>
                          <input className="form-control" readOnly value={datosTransaccion?.direccion || ''} />
                        </div>
                      </>
                    )}
                    {datosTransaccion?.tipoEntrega === 'RETIRO' && (
                      <div className="col-md-12">
                        <div className="alert alert-info mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>Dirección de retiro:</strong> Antonio Varas 666, Providencia, Santiago
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información de Pago */}
                  <h6 className="fw-bold mb-3"><i className="bi bi-wallet2 me-2"></i>Información de Pago</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Medio de Pago</label>
                      <input 
                        className="form-control" 
                        readOnly 
                        value={datosTransaccion?.tipoPago === 'DEBITO' ? 'Tarjeta de Débito' : datosTransaccion?.tipoPago === 'CREDITO' ? 'Tarjeta de Crédito' : 'Transferencia Bancaria'} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Tarjeta</label>
                      <input className="form-control" readOnly value={datosTransaccion?.infoTarjeta || ''} />
                    </div>
                  </div>

                  {/* Productos Comprados */}
                  <h6 className="fw-bold mb-3"><i className="bi bi-cart-check me-2"></i>Productos Comprados</h6>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Imagen</th>
                          <th>Nombre</th>
                          <th className="text-end">Precio</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => {
                          const precio = item.cotizacion?.valorAprox || item.precioUnitario || 0;
                          return (
                            <tr key={idx}>
                              <td>
                                <img 
                                  src={getImageUrl(item.producto?.imagenUrl || '')} 
                                  alt={item.nombreProducto} 
                                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} 
                                />
                              </td>
                              <td>{item.nombreProducto}</td>
                              <td className="text-end">{formatCLP(precio)}</td>
                              <td className="text-center"><span className="badge bg-secondary">{item.cantidad}</span></td>
                              <td className="text-end fw-bold">{formatCLP(precio * item.cantidad)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Resumen de Totales */}
                  <div className="card bg-light border-0 mt-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>{formatCLP(totales.subtotal)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Envío:</span>
                        <strong>{totales.envio === 0 ? 'Gratis ✅' : formatCLP(totales.envio)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>IVA (19%):</span>
                        <strong>{formatCLP(totales.iva)}</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fs-5 fw-bold">Total Pagado:</span>
                        <span className="fs-4 fw-bold text-success">{formatCLP(totales.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    {estado === 'ok' ? (
                      <>
                        <Link className="btn btn-primary btn-lg" to="/productos">
                          <i className="bi bi-shop me-2"></i>Seguir Comprando
                        </Link>
                        <Link className="btn btn-outline-secondary btn-lg ms-auto" to="/">
                          <i className="bi bi-house me-2"></i>Volver al Inicio
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link className="btn btn-success btn-lg" to="/carrito">
                          <i className="bi bi-arrow-left me-2"></i>Volver al Carrito
                        </Link>
                        <Link className="btn btn-outline-secondary btn-lg ms-auto" to="/productos">
                          <i className="bi bi-shop me-2"></i>Seguir Comprando
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
