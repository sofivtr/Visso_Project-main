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
  try { pedido = JSON.parse(sessionStorage.getItem('ultimo_pedido') || 'null'); } catch {}

  const encabezado = estado === 'ok'
    ? { titulo: `Se ha realizado la compra. nro ${pedido?.numero || ''}`, clase: 'alert alert-success d-flex align-items-center', icono: 'bi bi-check-circle me-2' }
    : { titulo: `No se pudo realizar el pago. nro ${pedido?.numero || ''}`, clase: 'alert alert-danger d-flex align-items-center', icono: 'bi bi-x-circle me-2' };

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

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Nombre</label>
                      <input className="form-control" readOnly value={pedido?.cliente?.nombre || ''} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">RUT</label>
                      <input className="form-control" readOnly value={pedido?.cliente?.rut || ''} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Correo</label>
                      <input className="form-control" readOnly value={pedido?.cliente?.email || ''} />
                    </div>
                  </div>

                  <h6 className="mt-3">Dirección de entrega de los productos</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Dirección</label>
                      <input className="form-control" readOnly value={pedido?.direccion?.calle || ''} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Región</label>
                      <input className="form-control" readOnly value={pedido?.direccion?.region || ''} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Comuna</label>
                      <input className="form-control" readOnly value={pedido?.direccion?.comuna || ''} />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Imagen</th>
                          <th>Nombre</th>
                          <th className="text-end">Precio</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(pedido?.items || []).map(it => (
                          <tr key={it.id}>
                            <td><img src={getImageUrl(it.imagenUrl)} alt={it.nombre} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} /></td>
                            <td>{it.nombre}</td>
                            <td className="text-end">{formatCLP(it.precio)}</td>
                            <td className="text-center">{it.cantidad}</td>
                            <td className="text-end">{formatCLP(it.precio * (it.cantidad || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-end fw-bold fs-5">Total pagado: {formatCLP(pedido?.totales?.total)}</div>

                  <div className="d-flex gap-2 mt-3">
                    {estado === 'ok' ? (
                      <>
                        <button className="btn btn-outline-danger" type="button" disabled>Imprimir boleta en PDF</button>
                        <button className="btn btn-success" type="button" disabled>Enviar boleta por email</button>
                        <Link className="btn btn-primary ms-auto" to="/productos">Seguir comprando</Link>
                      </>
                    ) : (
                      <>
                        <Link className="btn btn-success" to="/carrito">Volver a realizar el pago</Link>
                        <Link className="btn btn-secondary ms-auto" to="/productos">Seguir comprando</Link>
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
