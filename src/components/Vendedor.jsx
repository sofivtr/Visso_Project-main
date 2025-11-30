import { useEffect, useState } from 'react';
import { Api } from '../assets/js/api';

function Vendedor() {
  const [products, setProducts] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState('productos');
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, ped] = await Promise.all([
          Api.products(),
          Api.getPedidos()
        ]);
        setProducts(p);
        setPedidos(ped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getImageUrl = (imagenUrl) => {
    if (!imagenUrl) return '/placeholder.png';
    if (imagenUrl.startsWith('http')) return imagenUrl;
    return `http://localhost:8081${imagenUrl}`;
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
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Marca</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={10} className="text-center py-4">Cargando…</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={10} className="text-center py-4 text-muted">Sin productos</td></tr>
                    ) : (
                      products.map(producto => (
                        <tr key={producto.id}>
                          <td>{producto.id}</td>
                          <td>
                            {producto.imagenUrl ? (
                              <img src={getImageUrl(producto.imagenUrl)} alt={producto.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                            ) : (
                              <span className="text-muted">Sin imagen</span>
                            )}
                          </td>
                          <td>{producto.codigoProducto}</td>
                          <td>{producto.nombre}</td>
                          <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {producto.descripcion || '-'}
                          </td>
                          <td>{producto.categoria?.nombre || '-'}</td>
                          <td>{producto.marca?.nombre || '-'}</td>
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
                          <td><span className="badge bg-success">Cerrado</span></td>
                          <td>
                            <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#pedidoDetalleModal" onClick={() => setPedidoDetalle(pedido)}>
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
                    <img 
                      src={getImageUrl(productoDetalle.imagenUrl)} 
                      alt={productoDetalle.nombre} 
                      className="img-fluid rounded mb-3"
                      style={{maxHeight: '300px', objectFit: 'contain'}}
                    />
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
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                          <th>Cotización</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidoDetalle.detalles?.map(detalle => (
                          <tr key={detalle.id}>
                            <td>{detalle.producto?.nombre}</td>
                            <td className="text-center">{detalle.cantidad}</td>
                            <td>{formatCLP(detalle.precioUnitario)}</td>
                            <td>{formatCLP(detalle.precioUnitario * detalle.cantidad)}</td>
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
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colspan="3" className="text-end">Total:</th>
                          <th>
                            {formatCLP(
                              pedidoDetalle.detalles?.reduce((sum, det) => sum + (det.precioUnitario * det.cantidad), 0) || 0
                            )}
                          </th>
                          <th></th>
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
