import { useEffect, useState } from 'react';
import { Api } from '../assets/js/api';

function Vendedor() {
  const [products, setProducts] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState('productos');
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const [infoEnvioDetalle, setInfoEnvioDetalle] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, ped, cat] = await Promise.all([
          Api.products(),
          Api.getPedidos(),
          Api.categories()
        ]);
        setProducts(p);
        setPedidos(ped);
        setCategories(cat);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDespachar = async (carritoId) => {
    if (!confirm('¿Confirmar despacho de este pedido?')) return;
    try {
      await Api.marcarComoEnviado(carritoId);
      // Actualizar lista localmente
      setPedidos(prev => prev.map(p => 
        p.id === carritoId ? { ...p, estado: 'E' } : p
      ));
      alert('Pedido marcado como enviado');
    } catch (error) {
      console.error('Error al despachar:', error);
      alert('Error al marcar como enviado: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'P':
        return <span className="badge bg-warning text-dark">Por Despachar</span>;
      case 'E':
        return <span className="badge bg-success">Enviado</span>;
      case 'A':
        return <span className="badge bg-info">Activo</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getImageUrl = (imagenUrl) => {
    if (!imagenUrl) return '';
    if (imagenUrl.startsWith('http')) return imagenUrl;
    const BASE_URL = '';
    return `${BASE_URL}${imagenUrl}`;
  };

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="mb-4">
            <h2 className="mb-1">Panel de Vendedor</h2>
            <p className="text-muted mb-0">Visualiza productos y pedidos</p>
          </div>
          
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'productos' ? 'active' : ''}`} onClick={() => setSeccion('productos')}>Productos</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'pedidos' ? 'active' : ''}`} onClick={() => setSeccion('pedidos')}>Pedidos</button>
            </li>
          </ul>

          {/* Panel Productos */}
          {seccion === 'productos' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : products.length}</h3>
                    <p className="mb-0">Total de productos</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Lista de productos</h2>
                </div>
              </div>
              <div className="mb-3">
                <select 
                  className="form-select" 
                  style={{width: 'auto'}}
                  value={categoriaFiltro} 
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-4">Cargando…</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-muted">Sin productos</td></tr>
                    ) : (
                      products
                        .filter(p => !categoriaFiltro || p.categoria?.id === Number(categoriaFiltro))
                        .map(producto => (
                        <tr key={producto.id}>
                          <td>{producto.id}</td>
                          <td>
                            {/* === PLACEHOLDER BOLSITA EN TABLA === */}
                            {producto.imagenUrl ? (
                              <img src={getImageUrl(producto.imagenUrl)} alt={producto.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center bg-light rounded text-secondary" style={{width: '50px', height: '50px'}}>
                                <i className="bi bi-bag fs-4"></i>
                              </div>
                            )}
                            {/* ==================================== */}
                          </td>
                          <td>{producto.codigoProducto}</td>
                          <td>{producto.nombre}</td>
                          <td>{formatCLP(producto.precio)}</td>
                          <td>
                            {producto.stock === 0 ? (
                              <span className="badge bg-danger">Sin stock</span>
                            ) : producto.stock <= 5 ? (
                              <span className="badge bg-warning text-dark">{producto.stock}</span>
                            ) : (
                              <span className="badge bg-success">{producto.stock}</span>
                            )}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#productoDetalleModal" onClick={() => setProductoDetalle(producto)}>
                              <i className="bi bi-eye" /> Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Panel Pedidos */}
          {seccion === 'pedidos' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : pedidos.length}</h3>
                    <p className="mb-0">Total de pedidos</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Lista de pedidos</h2>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Total Items</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-4">Cargando…</td></tr>
                    ) : pedidos.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4 text-muted">Sin pedidos</td></tr>
                    ) : (
                      pedidos.map(pedido => (
                        <tr key={pedido.id}>
                          <td>{pedido.id}</td>
                          <td>{pedido.usuario?.nombre} {pedido.usuario?.apellido}</td>
                          <td>{pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString('es-CL') : '-'}</td>
                          <td>{pedido.detalles?.length || 0}</td>
                          <td>{getEstadoBadge(pedido.estado)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#pedidoDetalleModal" onClick={() => setPedidoDetalle(pedido)}>
                              <i className="bi bi-eye" /> Ver Detalle
                            </button>
                            <button className="btn btn-sm btn-outline-secondary me-2" data-bs-toggle="modal" data-bs-target="#infoEnvioModal" onClick={() => setInfoEnvioDetalle(pedido)}>
                              <i className="bi bi-truck" /> Info Envío
                            </button>
                            {pedido.estado === 'P' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleDespachar(pedido.id)}>
                                <i className="bi bi-check-circle" /> Despachar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modal Detalle Producto */}
      <div className="modal fade" id="productoDetalleModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalle del Producto</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              {productoDetalle && (
                <div className="row">
                  <div className="col-md-4">
                    {/* === PLACEHOLDER BOLSITA EN MODAL === */}
                    {productoDetalle.imagenUrl ? (
                      <img 
                        src={getImageUrl(productoDetalle.imagenUrl)} 
                        alt={productoDetalle.nombre} 
                        className="img-fluid rounded mb-3"
                        style={{maxHeight: '300px', objectFit: 'contain'}}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center bg-light text-secondary rounded mb-3" style={{ height: '300px', width: '100%' }}>
                        <i className="bi bi-bag display-1"></i>
                      </div>
                    )}
                    {/* =================================== */}
                  </div>
                  <div className="col-md-8">
                    <h4 className="mb-3">{productoDetalle.nombre}</h4>
                    <div className="mb-2">
                      <strong>Código:</strong> {productoDetalle.codigoProducto}
                    </div>
                    <div className="mb-2">
                      <strong>Descripción:</strong> 
                      <p className="mt-1">{productoDetalle.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Categoría:</strong> {productoDetalle.categoria?.nombre || '-'}
                    </div>
                    <div className="mb-2">
                      <strong>Marca:</strong> {productoDetalle.marca?.nombre || '-'}
                    </div>
                    <div className="mb-2">
                      <strong>Precio:</strong> <span className="text-primary fs-5">{formatCLP(productoDetalle.precio)}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Stock:</strong> 
                      {productoDetalle.stock === 0 ? (
                        <span className="badge bg-danger ms-2">Sin stock</span>
                      ) : productoDetalle.stock <= 5 ? (
                        <span className="badge bg-warning text-dark ms-2">{productoDetalle.stock} unidades</span>
                      ) : (
                        <span className="badge bg-success ms-2">{productoDetalle.stock} unidades</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalle Pedido */}
      <div className="modal fade" id="pedidoDetalleModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalle del Pedido #{pedidoDetalle?.id}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              {pedidoDetalle && (
                <>
                  <div className="mb-4">
                    <h6 className="mb-3">Información del Cliente</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Nombre:</strong> {pedidoDetalle.usuario?.nombre} {pedidoDetalle.usuario?.apellido}</p>
                        <p><strong>Email:</strong> {pedidoDetalle.usuario?.email}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>RUT:</strong> {pedidoDetalle.usuario?.rut || '-'}</p>
                        <p><strong>Fecha:</strong> {pedidoDetalle.fechaCreacion ? new Date(pedidoDetalle.fechaCreacion).toLocaleDateString('es-CL') : '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h6 className="mb-3">Productos del Pedido</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Cotización</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidoDetalle.detalles?.map(detalle => (
                          <tr key={detalle.id}>
                            <td>{detalle.producto?.nombre}</td>
                            <td className="text-center">{detalle.cantidad}</td>
                            <td className="text-center">
                              {detalle.cotizacion ? (
                                <button 
                                  className="btn btn-sm btn-info text-white"
                                  data-bs-toggle="modal"
                                  data-bs-target="#cotizacionDetalleModal"
                                  onClick={() => setCotizacionDetalle(detalle.cotizacion)}
                                >
                                  <i className="bi bi-clipboard-check" /> Ver Cotización
                                </button>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{formatCLP(detalle.precioUnitario)}</td>
                            <td>{formatCLP(detalle.precioUnitario * detalle.cantidad)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colspan="4" className="text-end">Subtotal:</th>
                          <th>
                            {formatCLP(
                              pedidoDetalle.detalles?.reduce((sum, det) => sum + (det.precioUnitario * det.cantidad), 0) || 0
                            )}
                          </th>
                        </tr>
                        <tr>
                          <th colspan="4" className="text-end">Envío:</th>
                          <th>
                            {(() => {
                              const subtotal = pedidoDetalle.detalles?.reduce((sum, det) => sum + (det.precioUnitario * det.cantidad), 0) || 0;
                              const envio = subtotal > 50000 ? 0 : 3000;
                              return envio === 0 ? 'Gratis' : formatCLP(envio);
                            })()}
                          </th>
                        </tr>
                        <tr>
                          <th colspan="4" className="text-end">IVA (19%):</th>
                          <th>
                            {(() => {
                              const subtotal = pedidoDetalle.detalles?.reduce((sum, det) => sum + (det.precioUnitario * det.cantidad), 0) || 0;
                              const iva = subtotal * 0.19;
                              return formatCLP(iva);
                            })()}
                          </th>
                        </tr>
                        <tr>
                          <th colspan="4" className="text-end"><strong>Total:</strong></th>
                          <th>
                            <strong>
                              {(() => {
                                const subtotal = pedidoDetalle.detalles?.reduce((sum, det) => sum + (det.precioUnitario * det.cantidad), 0) || 0;
                                const iva = subtotal * 0.19;
                                const envio = subtotal > 50000 ? 0 : 3000;
                                const total = subtotal + iva + envio;
                                return formatCLP(total);
                              })()}
                            </strong>
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Info Envío */}
      <div className="modal fade" id="infoEnvioModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header border-bottom border-dark">
              <h5 className="modal-title"><i className="bi bi-truck me-2"></i>Información de Envío - Pedido #{infoEnvioDetalle?.id}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {infoEnvioDetalle && infoEnvioDetalle.datosTransaccion ? (
                <>
                  {/* Tipo de Entrega */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-box-seam me-2"></i>Tipo de Entrega
                    </h6>
                    <div className="alert alert-light border">
                      <span className={`badge ${infoEnvioDetalle.datosTransaccion.tipoEntrega === 'RETIRO' ? 'bg-warning' : 'bg-success'} me-2`}>
                        {infoEnvioDetalle.datosTransaccion.tipoEntrega === 'RETIRO' ? 'RETIRO EN TIENDA' : 'DESPACHO A DOMICILIO'}
                      </span>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-person-fill me-2"></i>Datos de Contacto
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Nombre:</strong> {infoEnvioDetalle.datosTransaccion.nombreContacto}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Teléfono:</strong> {infoEnvioDetalle.datosTransaccion.telefono}
                      </div>
                      <div className="col-md-12 mb-2">
                        <strong>Email:</strong> {infoEnvioDetalle.datosTransaccion.email}
                      </div>
                    </div>
                  </div>

                  {/* Dirección de Entrega (Solo si es DESPACHO) */}
                  {infoEnvioDetalle.datosTransaccion.tipoEntrega === 'DESPACHO' && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3 text-primary">
                        <i className="bi bi-geo-alt-fill me-2"></i>Dirección de Entrega
                      </h6>
                      <div className="alert alert-light border">
                        <p className="mb-1"><strong>Dirección:</strong> {infoEnvioDetalle.datosTransaccion.direccion}</p>
                        <p className="mb-1"><strong>Comuna:</strong> {infoEnvioDetalle.datosTransaccion.comuna}</p>
                        <p className="mb-0"><strong>Región:</strong> {infoEnvioDetalle.datosTransaccion.region}</p>
                      </div>
                    </div>
                  )}

                  {/* Información de Pago */}
                  <div className="mb-3">
                    <h6 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-credit-card me-2"></i>Información de Pago
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Tipo de Pago:</strong> 
                        <span className="badge bg-secondary ms-2">
                          {infoEnvioDetalle.datosTransaccion.tipoPago}
                        </span>
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Tarjeta:</strong> {infoEnvioDetalle.datosTransaccion.infoTarjeta}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No hay información de envío disponible para este pedido.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalle Cotización */}
      <div className="modal fade" id="cotizacionDetalleModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalle de Cotización</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              {cotizacionDetalle && (
                <>
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-3">Información del Paciente</h6>
                      <p><strong>Nombre:</strong> {cotizacionDetalle.nombrePaciente || '-'}</p>
                      <p><strong>Fecha Receta:</strong> {cotizacionDetalle.fechaReceta || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">Medidas</h6>
                      <p><strong>Grado OD:</strong> {cotizacionDetalle.gradoOd || '-'}</p>
                      <p><strong>Grado OI:</strong> {cotizacionDetalle.gradoOi || '-'}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-3">Especificaciones</h6>
                      <p><strong>Tipo de Lente:</strong> {cotizacionDetalle.tipoLente || '-'}</p>
                      <p><strong>Tipo de Cristal:</strong> {cotizacionDetalle.tipoCristal || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">Tratamientos</h6>
                      <p><strong>Antirreflejo:</strong> {cotizacionDetalle.antirreflejo ? 'Sí' : 'No'}</p>
                      <p><strong>Filtro Azul:</strong> {cotizacionDetalle.filtroAzul ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="alert alert-info">
                    <strong>Valor Aproximado:</strong> {formatCLP(cotizacionDetalle.valorAprox || 0)}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Vendedor;