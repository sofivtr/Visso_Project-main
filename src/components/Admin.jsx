import { useEffect, useState } from 'react';
import { Api } from '../assets/js/api';
import { validarRut, validarEmail, setFieldError, formatearRut } from '../assets/js/validaciones';

function Admin() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState('usuarios');
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [editandoMarca, setEditandoMarca] = useState(null);
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const abrirModalUsuario = (usuario = null) => {
    setEditandoUsuario(usuario);
    if (usuario) {
      // Pequeño delay para que el modal se abra antes de llenar los campos
      setTimeout(() => {
        const rutInput = document.getElementById('userRut');
        document.getElementById('userNombre').value = usuario.nombre || '';
        document.getElementById('userApellido').value = usuario.apellido || '';
        rutInput.value = usuario.rut || '';
        rutInput.disabled = true; // No se puede cambiar el RUT
        document.getElementById('userEmail').value = usuario.email || '';
        document.getElementById('userRol').value = usuario.rol || 'usuario';
        document.getElementById('userPassword').value = '';
      }, 100);
    } else {
      setTimeout(() => {
        document.getElementById('userAdminForm').reset();
        document.getElementById('userRut').disabled = false;
      }, 100);
    }
  };

  const abrirModalProducto = (producto = null) => {
    setEditandoProducto(producto);
    if (producto) {
      setTimeout(() => {
        const codigoInput = document.getElementById('productCodigo');
        codigoInput.value = producto.codigoProducto || '';
        codigoInput.disabled = true; // No se puede cambiar el código
        document.getElementById('productNombre').value = producto.nombre || '';
        document.getElementById('productDescripcion').value = producto.descripcion || '';
        document.getElementById('productCategoria').value = producto.categoria?.id || '';
        document.getElementById('productMarca').value = producto.marca?.id || '';
        document.getElementById('productPrecio').value = producto.precio || '';
        document.getElementById('productStock').value = producto.stock || 0;
      }, 100);
    } else {
      setTimeout(() => {
        document.getElementById('productAdminForm').reset();
        document.getElementById('productCodigo').disabled = false;
      }, 100);
    }
  };

  const abrirModalMarca = (marca = null) => {
    setEditandoMarca(marca);
    if (marca) {
      setTimeout(() => {
        document.getElementById('marcaNombre').value = marca.nombre || '';
      }, 100);
    } else {
      setTimeout(() => {
        document.getElementById('marcaForm').reset();
      }, 100);
    }
  };

  const abrirModalCategoria = (categoria = null) => {
    setEditandoCategoria(categoria);
    if (categoria) {
      setTimeout(() => {
        document.getElementById('categoriaNombre').value = categoria.nombre || '';
      }, 100);
    } else {
      setTimeout(() => {
        document.getElementById('categoriaForm').reset();
      }, 100);
    }
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await Api.deleteProduct(id);
      const p = await Api.products();
      setProducts(p);
    } catch (err) {
      alert('Error al eliminar producto: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarMarca = async (id) => {
    if (!confirm('¿Eliminar esta marca?')) return;
    try {
      await Api.deleteBrand(id);
      const b = await Api.brands();
      setBrands(b);
    } catch (err) {
      alert('Error al eliminar marca: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await Api.deleteCategory(id);
      const c = await Api.categories();
      setCategories(c);
    } catch (err) {
      alert('Error al eliminar categoría: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [u, p, c, b, ped] = await Promise.all([
          Api.users(), 
          Api.products(),
          Api.categories(),
          Api.brands(),
          Api.getPedidos()
        ]);
        setUsers(u);
        setProducts(p);
        setCategories(c);
        setBrands(b);
        setPedidos(ped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="mb-4">
            <h2 className="mb-1">Panel de Administrador</h2>
            <p className="text-muted mb-0">Gestiona usuarios y productos de forma eficiente</p>
          </div>
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'usuarios' ? 'active' : ''}`} onClick={() => setSeccion('usuarios')}>Usuarios</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'productos' ? 'active' : ''}`} onClick={() => setSeccion('productos')}>Productos</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'pedidos' ? 'active' : ''}`} onClick={() => setSeccion('pedidos')}>Pedidos</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'marcas' ? 'active' : ''}`} onClick={() => setSeccion('marcas')}>Marcas</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'categorias' ? 'active' : ''}`} onClick={() => setSeccion('categorias')}>Categorías</button>
            </li>
          </ul>

          {/* Panel Usuarios */}
          {seccion === 'usuarios' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : users.length}</h3>
                    <p className="mb-0">Total de usuarios</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Gestión de usuarios</h2>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => abrirModalUsuario(null)}>
                  <i className="bi bi-plus-circle" /> Agregar Usuario
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>RUT</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-4">Cargando…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-4 text-muted">Sin usuarios</td></tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.rut || '-'}</td>
                          <td>{u.nombre}</td>
                          <td>{u.apellido || '-'}</td>
                          <td>{u.email}</td>
                          <td><span className="badge bg-light text-dark text-capitalize">{u.rol}</span></td>
                          <td>{u.activo ? <span className="badge bg-success">Sí</span> : <span className="badge bg-danger">No</span>}</td>
                          <td className="text-nowrap">
                            <button className="btn btn-sm btn-success me-2" data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => abrirModalUsuario(u)}><i className="bi bi-pencil-square" /></button>
                            <button className="btn btn-sm btn-danger"><i className="bi bi-trash" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
                  <h2 className="gestion-title mb-0">Gestión de productos</h2>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#productModal" onClick={() => abrirModalProducto(null)}>
                  <i className="bi bi-plus-circle" /> Agregar Producto
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Marca</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} className="text-center py-4">Cargando…</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-4 text-muted">Sin productos</td></tr>
                    ) : (
                      products.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>
                            {p.imagenUrl ? (
                              <img src={`http://localhost:8081${p.imagenUrl}`} alt={p.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                            ) : (
                              <span className="text-muted">Sin imagen</span>
                            )}
                          </td>
                          <td>{p.codigoProducto}</td>
                          <td>{p.nombre}</td>
                          <td>{p.categoria?.nombre || '-'}</td>
                          <td>{p.marca?.nombre || '-'}</td>
                          <td>${p.precio.toLocaleString('es-CL')}</td>
                          <td>{p.stock}</td>
                          <td className="text-nowrap">
                            <button className="btn btn-sm btn-success me-2" data-bs-toggle="modal" data-bs-target="#productModal" onClick={() => abrirModalProducto(p)}><i className="bi bi-pencil-square" /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => eliminarProducto(p.id)}><i className="bi bi-trash" /></button>
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
                  <h2 className="gestion-title mb-0">Gestión de pedidos</h2>
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

          {/* Panel Marcas */}
          {seccion === 'marcas' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : brands.length}</h3>
                    <p className="mb-0">Total de marcas</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Gestión de marcas</h2>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#marcaModal" onClick={() => abrirModalMarca(null)}>
                  <i className="bi bi-plus-circle" /> Agregar Marca
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-4">Cargando…</td></tr>
                    ) : brands.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">Sin marcas</td></tr>
                    ) : (
                      brands.map(marca => (
                        <tr key={marca.id}>
                          <td>{marca.id}</td>
                          <td>
                            {marca.imagen ? (
                              <img src={`http://localhost:8081${marca.imagen}`} alt={marca.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                            ) : (
                              <span className="text-muted">Sin imagen</span>
                            )}
                          </td>
                          <td>{marca.nombre}</td>
                          <td className="text-nowrap">
                            <button className="btn btn-sm btn-success me-2" data-bs-toggle="modal" data-bs-target="#marcaModal" onClick={() => abrirModalMarca(marca)}><i className="bi bi-pencil-square" /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => eliminarMarca(marca.id)}><i className="bi bi-trash" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Panel Categorías */}
          {seccion === 'categorias' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : categories.length}</h3>
                    <p className="mb-0">Total de categorías</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Gestión de categorías</h2>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#categoriaModal" onClick={() => abrirModalCategoria(null)}>
                  <i className="bi bi-plus-circle" /> Agregar Categoría
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-4">Cargando…</td></tr>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-muted">Sin categorías</td></tr>
                    ) : (
                      categories.map(categoria => (
                        <tr key={categoria.id}>
                          <td>{categoria.id}</td>
                          <td>{categoria.nombre}</td>
                          <td className="text-nowrap">
                            <button className="btn btn-sm btn-success me-2" data-bs-toggle="modal" data-bs-target="#categoriaModal" onClick={() => abrirModalCategoria(categoria)}><i className="bi bi-pencil-square" /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => eliminarCategoria(categoria.id)}><i className="bi bi-trash" /></button>
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

        {/* Modales de usuario y producto (solo presentación, no funcionales) */}
        <div className="modal fade" id="userModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editandoUsuario ? 'Editar Usuario' : 'Agregar Usuario'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                <form id="userAdminForm" noValidate onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const nombre = form.querySelector('#userNombre');
                  const apellido = form.querySelector('#userApellido');
                  const rut = form.querySelector('#userRut');
                  const email = form.querySelector('#userEmail');
                  const pass = form.querySelector('#userPassword');
                  const rol = form.querySelector('#userRol');
                  const nombreErr = form.querySelector('#userNombreError');
                  const apellidoErr = form.querySelector('#userApellidoError');
                  const rutErr = form.querySelector('#userRutError');
                  const emailErr = form.querySelector('#userEmailError');
                  const passErr = form.querySelector('#userPasswordError');
                  const success = form.parentElement.querySelector('#userAdminSuccess');
                  if (success) success.style.display = 'none';
                  let ok = true;
                  if (!nombre.value.trim()) { setFieldError(nombre, nombreErr, 'Ingrese el nombre'); ok = false; } else { setFieldError(nombre, nombreErr, ''); }
                  if (!apellido.value.trim()) { setFieldError(apellido, apellidoErr, 'Ingrese el apellido'); ok = false; } else { setFieldError(apellido, apellidoErr, ''); }
                  if (rut.value) rut.value = formatearRut(rut.value);
                  if (!validarRut(rut.value)) { setFieldError(rut, rutErr, 'RUT inválido'); ok = false; } else { setFieldError(rut, rutErr, ''); }
                  if (!validarEmail(email.value)) { setFieldError(email, emailErr, 'Correo inválido'); ok = false; } else { setFieldError(email, emailErr, ''); }
                  // Si es edición y no hay password, es válido (mantener actual)
                  if (!editandoUsuario && (!pass.value || pass.value.length < 8)) { setFieldError(pass, passErr, 'Mínimo 8 caracteres'); ok = false; } else if (pass.value && pass.value.length < 8) { setFieldError(pass, passErr, 'Mínimo 8 caracteres'); ok = false; } else { setFieldError(pass, passErr, ''); }
                  if (!ok) return;
                  
                  try {
                    const datosUsuario = {
                      nombre: nombre.value.trim(),
                      apellido: apellido.value.trim(),
                      rut: rut.value,
                      email: email.value.trim(),
                      rol: rol.value,
                      activo: true
                    };
                    // Solo incluir password si se ingresó uno nuevo
                    if (pass.value) {
                      datosUsuario.passwordHash = pass.value;
                    }
                    
                    if (editandoUsuario) {
                      await Api.updateUser(editandoUsuario.id, datosUsuario);
                    } else {
                      await Api.createUser(datosUsuario);
                    }
                    const u = await Api.users();
                    setUsers(u);
                    form.reset();
                    if (success) {
                      success.style.display = 'block';
                      setTimeout(() => { success.style.display = 'none'; }, 3000);
                    }
                  } catch (err) {
                    const errorMsg = err.response?.data || 'Error al guardar usuario';
                    console.log('ERROR:', errorMsg, 'TIENE RUT?', errorMsg.toUpperCase().includes('RUT'));
                    // Mostrar error en el campo correcto según el mensaje
                    if (errorMsg.toUpperCase().includes('RUT')) {
                      setFieldError(rut, rutErr, errorMsg);
                    } else if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
                      setFieldError(email, emailErr, errorMsg);
                    } else {
                      setFieldError(email, emailErr, errorMsg);
                    }
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="userNombre" className="form-label">Nombre</label>
                    <input id="userNombre" className="form-control" />
                    <div id="userNombreError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userApellido" className="form-label">Apellido</label>
                    <input id="userApellido" className="form-control" />
                    <div id="userApellidoError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userRut" className="form-label">RUT</label>
                    <input id="userRut" className="form-control" placeholder="12.345.678-9" />
                    <div id="userRutError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userEmail" className="form-label">Email</label>
                    <input id="userEmail" type="email" className="form-control" placeholder="correo@ejemplo.com" />
                    <div id="userEmailError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userRol" className="form-label">Rol</label>
                    <select id="userRol" className="form-select">
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userPassword" className="form-label">Contraseña {editandoUsuario && <small className="text-muted">(opcional - dejar vacío para mantener actual)</small>}</label>
                    <input id="userPassword" type="password" className="form-control" placeholder={editandoUsuario ? "Dejar vacío para mantener" : "Mínimo 8 caracteres"} />
                    <div id="userPasswordError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                </form>
                <div id="userAdminSuccess" className="alert alert-success mt-2" style={{display:'none'}}>Usuario guardado con éxito.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="submit" className="btn btn-primary" form="userAdminForm">Guardar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="productModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editandoProducto ? 'Editar Producto' : 'Agregar Producto'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                <form id="productAdminForm" noValidate onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const codigo = form.querySelector('#productCodigo');
                  const nombre = form.querySelector('#productNombre');
                  const descripcion = form.querySelector('#productDescripcion');
                  const categoriaId = form.querySelector('#productCategoria');
                  const marcaId = form.querySelector('#productMarca');
                  const precio = form.querySelector('#productPrecio');
                  const stock = form.querySelector('#productStock');
                  const imagen = form.querySelector('#productImagen');
                  const codigoErr = form.querySelector('#productCodigoError');
                  const nombreErr = form.querySelector('#productNombreError');
                  const categoriaErr = form.querySelector('#productCategoriaError');
                  const marcaErr = form.querySelector('#productMarcaError');
                  const precioErr = form.querySelector('#productPrecioError');
                  const stockErr = form.querySelector('#productStockError');
                  const success = form.parentElement.querySelector('#productAdminSuccess');
                  if (success) success.style.display = 'none';
                  let ok = true;
                  if (!codigo.value.trim()) { setFieldError(codigo, codigoErr, 'Ingrese el código'); ok = false; } else { setFieldError(codigo, codigoErr, ''); }
                  if (!nombre.value.trim()) { setFieldError(nombre, nombreErr, 'Ingrese el nombre'); ok = false; } else { setFieldError(nombre, nombreErr, ''); }
                  if (!categoriaId.value) { setFieldError(categoriaId, categoriaErr, 'Seleccione una categoría'); ok = false; } else { setFieldError(categoriaId, categoriaErr, ''); }
                  if (!marcaId.value) { setFieldError(marcaId, marcaErr, 'Seleccione una marca'); ok = false; } else { setFieldError(marcaId, marcaErr, ''); }
                  const precioVal = Number(precio.value);
                  if (Number.isNaN(precioVal) || precioVal <= 0) { setFieldError(precio, precioErr, 'Ingrese un precio válido (> 0)'); ok = false; } else { setFieldError(precio, precioErr, ''); }
                  const stockVal = Number(stock.value);
                  if (Number.isNaN(stockVal) || stockVal < 0) { setFieldError(stock, stockErr, 'Ingrese stock válido (>= 0)'); ok = false; } else { setFieldError(stock, stockErr, ''); }
                  if (!ok) return;
                  
                  try {
                    const formData = new FormData();
                    formData.append('codigoProducto', codigo.value.trim());
                    formData.append('nombre', nombre.value.trim());
                    formData.append('descripcion', descripcion.value.trim());
                    formData.append('categoriaId', categoriaId.value);
                    formData.append('marcaId', marcaId.value);
                    formData.append('precio', precioVal);
                    formData.append('stock', stockVal);
                    if (imagen.files[0]) {
                      formData.append('imagen', imagen.files[0]);
                    }
                    
                    if (editandoProducto) {
                      await Api.updateProduct(editandoProducto.id, formData);
                    } else {
                      await Api.createProduct(formData);
                    }
                    const [u, p, c, b] = await Promise.all([Api.users(), Api.products(), Api.categories(), Api.brands()]);
                    setUsers(u);
                    setProducts(p);
                    setCategories(c);
                    setBrands(b);
                    form.reset();
                    if (success) {
                      success.style.display = 'block';
                      setTimeout(() => { success.style.display = 'none'; }, 3000);
                    }
                  } catch (err) {
                    console.error('Error al guardar producto:', err);
                    const errorMsg = err.response?.data?.message || err.response?.data || 'Error al guardar producto';
                    setFieldError(nombre, nombreErr, errorMsg);
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="productCodigo" className="form-label">Código</label>
                    <input id="productCodigo" className="form-control" placeholder="ej: PROD001" />
                    <div id="productCodigoError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productNombre" className="form-label">Nombre</label>
                    <input id="productNombre" className="form-control" />
                    <div id="productNombreError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productDescripcion" className="form-label">Descripción</label>
                    <textarea id="productDescripcion" className="form-control" rows={3} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productCategoria" className="form-label">Categoría</label>
                    <select id="productCategoria" className="form-select">
                      <option value="">Seleccionar categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                    <div id="productCategoriaError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productMarca" className="form-label">Marca</label>
                    <select id="productMarca" className="form-select">
                      <option value="">Seleccionar marca</option>
                      {brands.map(marca => (
                        <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                      ))}
                    </select>
                    <div id="productMarcaError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productPrecio" className="form-label">Precio</label>
                    <input id="productPrecio" type="number" className="form-control" min="0" step="1" />
                    <div id="productPrecioError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productStock" className="form-label">Stock</label>
                    <input id="productStock" type="number" className="form-control" min="0" step="1" defaultValue="0" />
                    <div id="productStockError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagen" className="form-label">Imagen {editandoProducto && <small className="text-muted">(opcional - dejar vacío para mantener actual)</small>}</label>
                    <input id="productImagen" type="file" className="form-control" accept="image/*" />
                    <small className="text-muted">Formatos: JPG, PNG, GIF, WEBP, AVIF (máx 5MB)</small>
                  </div>
                </form>
                <div id="productAdminSuccess" className="alert alert-success mt-2" style={{display:'none'}}>Producto guardado con éxito.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="submit" className="btn btn-primary" form="productAdminForm">Guardar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Detalle Pedido */}
        <div className="modal fade" id="pedidoDetalleModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle del Pedido #{pedidoDetalle?.id}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                {pedidoDetalle && (
                  <>
                    <div className="mb-3">
                      <p><strong>Usuario:</strong> {pedidoDetalle.usuario?.nombre} {pedidoDetalle.usuario?.apellido}</p>
                      <p><strong>Email:</strong> {pedidoDetalle.usuario?.email}</p>
                      <p><strong>Fecha:</strong> {pedidoDetalle.fechaCreacion ? new Date(pedidoDetalle.fechaCreacion).toLocaleDateString('es-CL') : '-'}</p>
                    </div>
                    <h6 className="mb-3">Productos:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
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
                              <td>{detalle.cantidad}</td>
                              <td>${detalle.precioUnitario?.toLocaleString('es-CL')}</td>
                              <td>${(detalle.precioUnitario * detalle.cantidad)?.toLocaleString('es-CL')}</td>
                              <td>
                                {detalle.cotizacion ? (
                                  <span className="badge bg-info">
                                    <i className="bi bi-clipboard-check" /> Cotización #{detalle.cotizacion.id}
                                  </span>
                                ) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
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

        {/* Modal Marca */}
        <div className="modal fade" id="marcaModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editandoMarca ? 'Editar Marca' : 'Agregar Marca'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                <form id="marcaForm" noValidate onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const nombre = form.querySelector('#marcaNombre');
                  const imagen = form.querySelector('#marcaImagen');
                  const nombreErr = form.querySelector('#marcaNombreError');
                  const success = form.parentElement.querySelector('#marcaSuccess');
                  if (success) success.style.display = 'none';
                  
                  if (!nombre.value.trim()) {
                    setFieldError(nombre, nombreErr, 'Ingrese el nombre de la marca');
                    return;
                  } else {
                    setFieldError(nombre, nombreErr, '');
                  }
                  
                  try {
                    const formData = new FormData();
                    formData.append('nombre', nombre.value.trim());
                    if (imagen.files[0]) {
                      formData.append('imagen', imagen.files[0]);
                    }
                    
                    if (editandoMarca) {
                      await Api.updateBrand(editandoMarca.id, formData);
                    } else {
                      await Api.createBrand(formData);
                    }
                    
                    const b = await Api.brands();
                    setBrands(b);
                    form.reset();
                    if (success) {
                      success.style.display = 'block';
                      setTimeout(() => { success.style.display = 'none'; }, 3000);
                    }
                  } catch (err) {
                    console.error('Error al guardar marca:', err);
                    setFieldError(nombre, nombreErr, err.response?.data?.message || 'Error al guardar marca');
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="marcaNombre" className="form-label">Nombre *</label>
                    <input id="marcaNombre" className="form-control" placeholder="Ej: Ray-Ban" />
                    <div id="marcaNombreError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="marcaImagen" className="form-label">Imagen {editandoMarca && <small className="text-muted">(opcional - dejar vacío para mantener actual)</small>}</label>
                    <input id="marcaImagen" type="file" className="form-control" accept="image/*" />
                    <small className="text-muted">Formatos: JPG, PNG, GIF, WEBP, AVIF (máx 5MB)</small>
                  </div>
                </form>
                <div id="marcaSuccess" className="alert alert-success mt-2" style={{display:'none'}}>Marca guardada con éxito.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="submit" className="btn btn-primary" form="marcaForm">Guardar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Categoría */}
        <div className="modal fade" id="categoriaModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editandoCategoria ? 'Editar Categoría' : 'Agregar Categoría'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                <form id="categoriaForm" noValidate onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const nombre = form.querySelector('#categoriaNombre');
                  const nombreErr = form.querySelector('#categoriaNombreError');
                  const success = form.parentElement.querySelector('#categoriaSuccess');
                  if (success) success.style.display = 'none';
                  
                  if (!nombre.value.trim()) {
                    setFieldError(nombre, nombreErr, 'Ingrese el nombre de la categoría');
                    return;
                  } else {
                    setFieldError(nombre, nombreErr, '');
                  }
                  
                  try {
                    const categoriaData = { nombre: nombre.value.trim() };
                    
                    if (editandoCategoria) {
                      await Api.updateCategory(editandoCategoria.id, categoriaData);
                    } else {
                      await Api.createCategory(categoriaData);
                    }
                    
                    const c = await Api.categories();
                    setCategories(c);
                    form.reset();
                    if (success) {
                      success.style.display = 'block';
                      setTimeout(() => { success.style.display = 'none'; }, 3000);
                    }
                  } catch (err) {
                    console.error('Error al guardar categoría:', err);
                    setFieldError(nombre, nombreErr, err.response?.data?.message || 'Error al guardar categoría');
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="categoriaNombre" className="form-label">Nombre *</label>
                    <input id="categoriaNombre" className="form-control" placeholder="Ej: Ópticos" />
                    <div id="categoriaNombreError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                </form>
                <div id="categoriaSuccess" className="alert alert-success mt-2" style={{display:'none'}}>Categoría guardada con éxito.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="submit" className="btn btn-primary" form="categoriaForm">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Admin;
