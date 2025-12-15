import { useEffect, useState } from 'react';
import { Api } from '../assets/js/api';
import { validarRut, validarEmail, setFieldError, formatearRut } from '../assets/js/validaciones';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORIAS_FIJAS = ['Opticos', 'Lentes de sol', 'Lentes de contacto', 'Accesorios'];

function Admin() {
  const BASE_URL = ''; 
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeDetalle, setMensajeDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [seccion, setSeccion] = useState('dashboard');
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [editandoMarca, setEditandoMarca] = useState(null);
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const [infoEnvioDetalle, setInfoEnvioDetalle] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

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
    if (categoria && CATEGORIAS_FIJAS.includes(categoria.nombre)) {
      alert('No se puede modificar porque es una categoría fija del sistema.');
      return;
    }
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

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await Api.deleteUser(id);
      const u = await Api.users();
      setUsers(u);
      alert('Usuario eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      if (err.response?.status === 403 || err.response?.status === 400) {
        alert('No se puede eliminar el usuario porque está asociado a un pedido.');
      } else {
        alert('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await Api.deleteProduct(id);
      const p = await Api.products();
      setProducts(p);
      alert('Producto eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      if (err.response?.status === 403 || err.response?.status === 400) {
        alert('No se puede eliminar el producto porque está asociado a pedidos existentes.');
      } else {
        alert('Error al eliminar producto: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const eliminarMarca = async (id) => {
    if (!confirm('¿Eliminar esta marca?')) return;
    try {
      await Api.deleteBrand(id);
      const b = await Api.brands();
      setBrands(b);
      alert('Marca eliminada exitosamente');
    } catch (err) {
      if (err.response?.status === 400) {
        alert('No se puede eliminar la marca porque tiene productos asociados. Primero elimine o reasigne los productos.');
      } else {
        alert('Error al eliminar marca: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const eliminarCategoria = async (id) => {
    const categoria = categories.find(c => c.id === id);
    if (categoria && CATEGORIAS_FIJAS.includes(categoria.nombre)) {
      alert('No se puede eliminar porque es una categoría fija del sistema.');
      return;
    }
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await Api.deleteCategory(id);
      const c = await Api.categories();
      setCategories(c);
      alert('Categoría eliminada exitosamente');
    } catch (err) {
      if (err.response?.status === 400) {
        alert('No se puede eliminar la categoría porque tiene productos asociados. Primero elimine o reasigne los productos.');
      } else {
        alert('Error al eliminar categoría: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [u, p, c, b, ped, msgs] = await Promise.all([
          Api.users(), 
          Api.products(),
          Api.categories(),
          Api.brands(),
          Api.getPedidos(),
          Api.getMensajes()
        ]);
        setUsers(u);
        setProducts(p);
        setCategories(c);
        setBrands(b);
        setPedidos(ped);
        setMensajes(msgs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleMarcarRespondido = async (mensajeId) => {
    if (!confirm('¿Marcar este mensaje como respondido?')) return;
    try {
      await Api.cambiarEstadoMensaje(mensajeId, 'RESPONDIDO');
      // Actualizar lista localmente
      setMensajes(prev => prev.map(m => 
        m.id === mensajeId ? { ...m, estado: 'RESPONDIDO' } : m
      ));
      // Cerrar modal usando el botón de cerrar
      document.querySelector('#mensajeDetalleModal .btn-close')?.click();
      alert('Mensaje marcado como respondido');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const getEstadoMensajeBadge = (estado) => {
    switch(estado) {
      case 'PENDIENTE':
        return <span className="badge bg-warning text-dark">Pendiente</span>;
      case 'RESPONDIDO':
        return <span className="badge bg-success">Respondido</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  const getAsuntoBadge = (asunto) => {
    const badges = {
      'Consulta General': 'bg-info',
      'Reclamo': 'bg-danger',
      'Sugerencia': 'bg-primary',
      'Otros': 'bg-secondary'
    };
    const badgeClass = badges[asunto] || 'bg-secondary';
    return <span className={`badge ${badgeClass}`}>{asunto}</span>;
  };

  // Calcular métricas del Dashboard
  const calcularIngresosTotales = () => {
    return pedidos
      .filter(p => p.estado === 'P' || p.estado === 'E')
      .reduce((sum, p) => {
        const subtotal = p.total || 0;
        const envio = subtotal > 50000 ? 0 : 3000;
        const ingresoReal = subtotal + envio; // Sin IVA, ya que va al Estado
        return sum + ingresoReal;
      }, 0);
  };

  const calcularPedidosCerrados = () => {
    return pedidos.filter(p => p.estado === 'P' || p.estado === 'E').length;
  };

  const calcularAlertasStock = () => {
    return products.filter(p => p.stock < 5).length;
  };

  const obtenerStockPorCategoria = () => {
    const categoriaStock = {};
    products.forEach(p => {
      const catNombre = p.categoria?.nombre || 'Sin categoría';
      if (!categoriaStock[catNombre]) {
        categoriaStock[catNombre] = 0;
      }
      categoriaStock[catNombre] += p.stock || 0;
    });
    return Object.keys(categoriaStock).map(cat => ({
      nombre: cat,
      stock: categoriaStock[cat]
    }));
  };

  const obtenerEstadoPedidos = () => {
    const porDespachar = pedidos.filter(p => p.estado === 'P').length;
    const enviados = pedidos.filter(p => p.estado === 'E').length;
    return [
      { nombre: 'Por Despachar', value: porDespachar },
      { nombre: 'Enviados', value: enviados }
    ];
  };

  const obtenerTopProductos = () => {
    // Contar ventas por producto desde los pedidos
    const ventasPorProducto = {};
    
    pedidos.forEach(pedido => {
      // Incluir tanto pedidos pendientes como enviados
      if ((pedido.estado === 'P' || pedido.estado === 'E') && pedido.detalles) {
        pedido.detalles.forEach(detalle => {
          const productoId = detalle.producto?.id;
          const nombreProducto = detalle.producto?.nombre || 'Desconocido';
          
          if (productoId) {
            if (!ventasPorProducto[productoId]) {
              ventasPorProducto[productoId] = {
                nombre: nombreProducto,
                cantidad: 0,
                ingresos: 0
              };
            }
            ventasPorProducto[productoId].cantidad += detalle.cantidad;
            ventasPorProducto[productoId].ingresos += detalle.precioUnitario * detalle.cantidad;
          }
        });
      }
    });
    
    // Convertir a array y ordenar por cantidad vendida
    return Object.values(ventasPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5
  };

  const obtenerVentasPorMarca = () => {
    const ventasPorMarca = {};
    
    pedidos.forEach(pedido => {
      if ((pedido.estado === 'P' || pedido.estado === 'E') && pedido.detalles) {
        pedido.detalles.forEach(detalle => {
          const marca = detalle.producto?.marca?.nombre || 'Sin marca';
          
          if (!ventasPorMarca[marca]) {
            ventasPorMarca[marca] = {
              nombre: marca,
              value: 0
            };
          }
          ventasPorMarca[marca].value += detalle.precioUnitario * detalle.cantidad;
        });
      }
    });
    
    return Object.values(ventasPorMarca).sort((a, b) => b.value - a.value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const PIE_COLORS = ['#ffc107', '#28a745'];
  const BRAND_COLORS = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#00f2fe', '#fee140'];

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
              <button className={`nav-link ${seccion === 'dashboard' ? 'active' : ''}`} onClick={() => setSeccion('dashboard')}>Dashboard</button>
            </li>
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
            <li className="nav-item">
              <button className={`nav-link ${seccion === 'mensajes' ? 'active' : ''}`} onClick={() => setSeccion('mensajes')}>Mensajes</button>
            </li>
          </ul>

          {/* Panel Dashboard */}
          {seccion === 'dashboard' && (
            <>
              <h2 className="gestion-title mb-4">Dashboard de Métricas</h2>
              
              {/* KPIs Cards */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body text-center p-4">
                      <h5 className="card-title mb-3"><i className="bi bi-cash-stack"></i> Ingresos Totales</h5>
                      <h3 className="mb-0 fw-bold">{loading ? '—' : formatCLP(calcularIngresosTotales())}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body text-center p-4">
                      <h5 className="card-title mb-3"><i className="bi bi-box-seam"></i> Pedidos</h5>
                      <h3 className="mb-0 fw-bold">{loading ? '—' : calcularPedidosCerrados()}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 text-white" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body text-center p-4">
                      <h5 className="card-title mb-3"><i className="bi bi-envelope-fill"></i> Mensajes Pendientes</h5>
                      <h3 className="mb-0 fw-bold">{loading ? '—' : mensajes.filter(m => m.estado === 'PENDIENTE').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 text-white" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body text-center p-4">
                      <h5 className="card-title mb-3"><i className="bi bi-exclamation-triangle-fill"></i> Alerta de Stock</h5>
                      <h3 className="mb-0 fw-bold">{loading ? '—' : calcularAlertasStock()}</h3>
                      <small>Productos con stock &lt; 5</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="row g-4">
                <div className="col-12">
                  <div className="card border-0" style={{boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body">
                      <h5 className="card-title mb-4"><i className="bi bi-bar-chart-fill"></i> Stock por Categoría</h5>
                      {!loading && obtenerStockPorCategoria().length > 0 ? (
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                          <BarChart data={obtenerStockPorCategoria()} layout="vertical" margin={{ left: 10, right: isMobile ? 10 : 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 'auto']} />
                            <YAxis 
                              type="category" 
                              dataKey="nombre" 
                              width={isMobile ? 80 : 130}
                              style={{ fontSize: isMobile ? '10px' : '13px' }}
                            />
                            <Tooltip formatter={(value) => [`${value.toLocaleString('es-CL')} unidades`, 'Stock']}/>
                            <Bar dataKey="stock" fill="#8884d8" name="Stock Total" barSize={isMobile ? 25 : 40}>
                              {obtenerStockPorCategoria().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'No hay datos disponibles'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card border-0" style={{boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body">
                      <h5 className="card-title mb-4"><i className="bi bi-pie-chart-fill"></i> Estado de Pedidos</h5>
                      {!loading && obtenerEstadoPedidos().some(e => e.value > 0) ? (
                        <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
                          <PieChart>
                            <Pie
                              data={obtenerEstadoPedidos()}
                              cx="50%"
                              cy="50%"
                              labelLine={!isMobile}
                              label={isMobile ? false : ({ nombre, value, percent }) => `${nombre}: ${value} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={isMobile ? 80 : 120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="nombre"
                            >
                              {obtenerEstadoPedidos().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} pedidos`, name]}/>
                            {isMobile && <Legend verticalAlign="bottom" height={36} />}
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'No hay pedidos cerrados'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Nuevos gráficos */}
                <div className="col-12">
                  <div className="card border-0" style={{boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body">
                      <h5 className="card-title mb-4"><i className="bi bi-trophy-fill"></i> Top 5 Productos Más Vendidos</h5>
                      {!loading && obtenerTopProductos().length > 0 ? (
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                          <BarChart data={obtenerTopProductos()} layout="vertical" margin={{ left: 10, right: isMobile ? 10 : 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 'auto']} />
                            <YAxis 
                              type="category" 
                              dataKey="nombre" 
                              width={isMobile ? 100 : 180}
                              style={{ fontSize: isMobile ? '10px' : '13px' }}
                            />
                            <Tooltip 
                              formatter={(value, name) => {
                                if (name === 'cantidad') return [`${value} unidades`, 'Vendidas'];
                                if (name === 'ingresos') return [formatCLP(value), 'Ingresos'];
                                return value;
                              }}
                            />
                            <Bar dataKey="cantidad" fill="#667eea" name="cantidad" barSize={isMobile ? 20 : 30}>
                              {obtenerTopProductos().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'No hay productos vendidos'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0" style={{boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <div className="card-body">
                      <h5 className="card-title mb-4"><i className="bi bi-tag-fill"></i> Ventas por Marca</h5>
                      {!loading && obtenerVentasPorMarca().length > 0 ? (
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
                          <BarChart data={obtenerVentasPorMarca()} layout="vertical" margin={{ left: 10, right: isMobile ? 10 : 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 'auto']} />
                            <YAxis 
                              type="category" 
                              dataKey="nombre" 
                              width={isMobile ? 100 : 150}
                              style={{ fontSize: isMobile ? '10px' : '13px' }}
                            />
                            <Tooltip formatter={(value) => [formatCLP(value), 'Ventas']}/>
                            <Bar dataKey="value" fill="#667eea" name="Ventas" barSize={isMobile ? 25 : 35}>
                              {obtenerVentasPorMarca().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'No hay ventas por marca'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
                            <button className="btn btn-sm btn-danger" onClick={() => eliminarUsuario(u.id)}><i className="bi bi-trash" /></button>
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
              <div className="mb-3 d-flex gap-3 align-items-center">
                <button className="btn btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#productModal" onClick={() => abrirModalProducto(null)}>
                  <i className="bi bi-plus-circle" /> Agregar Producto
                </button>
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
                        .map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>
                            {p.imagenUrl ? (
                              <img src={`${BASE_URL}${p.imagenUrl}`} alt={p.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                            ) : (
                              <span className="text-muted">Sin imagen</span>
                            )}
                          </td>
                          <td>{p.codigoProducto}</td>
                          <td>{p.nombre}</td>
                          <td>${p.precio.toLocaleString('es-CL')}</td>
                          <td>
                            {p.stock === 0 ? (
                              <span className="badge bg-danger">Sin stock</span>
                            ) : p.stock <= 5 ? (
                              <span className="badge bg-warning text-dark">{p.stock}</span>
                            ) : (
                              <span className="badge bg-success">{p.stock}</span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            <button className="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#productoDetalleModal" onClick={() => setProductoDetalle(p)}>
                              <i className="bi bi-eye" /> Ver Detalle
                            </button>
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
                              <img src={`${BASE_URL}${marca.imagen}`} alt={marca.nombre} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
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

          {/* Panel Mensajes */}
          {seccion === 'mensajes' && (
            <>
              <div className="row g-4 align-items-center mb-3">
                <div className="col-md-3">
                  <div className="stats-card text-center p-4 rounded border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <h3 className="mb-1 fw-bold">{loading ? '—' : mensajes.length}</h3>
                    <p className="mb-0">Total de mensajes</p>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="gestion-title mb-0">Gestión de mensajes de contacto</h2>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Remitente</th>
                      <th>Email</th>
                      <th>Asunto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-4">Cargando…</td></tr>
                    ) : mensajes.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-muted">Sin mensajes</td></tr>
                    ) : (
                      mensajes.map(mensaje => (
                        <tr key={mensaje.id}>
                          <td>{mensaje.id}</td>
                          <td>{mensaje.fechaCreacion ? new Date(mensaje.fechaCreacion).toLocaleDateString('es-CL') : '-'}</td>
                          <td>{mensaje.nombre}</td>
                          <td>{mensaje.email}</td>
                          <td>{getAsuntoBadge(mensaje.asunto)}</td>
                          <td>{getEstadoMensajeBadge(mensaje.estado)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary" 
                              data-bs-toggle="modal" 
                              data-bs-target="#mensajeDetalleModal" 
                              onClick={() => setMensajeDetalle(mensaje)}
                            >
                              <i className="bi bi-envelope-open" /> Ver Mensaje
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
                      <option value="vendedor">Vendedor</option>
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
                  const imagenErr = form.querySelector('#productImagenError');
                  const success = form.parentElement.querySelector('#productAdminSuccess');
                  if (success) success.style.display = 'none';
                  let ok = true;
                  if (!codigo.value.trim()) { setFieldError(codigo, codigoErr, 'Ingrese el código'); ok = false; } 
                  else if (codigo.value.trim().length > 10) { setFieldError(codigo, codigoErr, 'El código no debe superar los 10 caracteres'); ok = false; } 
                  else { setFieldError(codigo, codigoErr, ''); }
                  if (!nombre.value.trim()) { setFieldError(nombre, nombreErr, 'Ingrese el nombre'); ok = false; } else { setFieldError(nombre, nombreErr, ''); }
                  if (!categoriaId.value) { setFieldError(categoriaId, categoriaErr, 'Seleccione una categoría'); ok = false; } else { setFieldError(categoriaId, categoriaErr, ''); }
                  if (!marcaId.value) { setFieldError(marcaId, marcaErr, 'Seleccione una marca'); ok = false; } else { setFieldError(marcaId, marcaErr, ''); }
                  
                  // Validar que precio sea un número entero sin decimales
                  if (!precio.value.trim()) { setFieldError(precio, precioErr, 'Ingrese el precio'); ok = false; }
                  else if (!/^\d+$/.test(precio.value.trim())) { setFieldError(precio, precioErr, 'El precio debe ser un número entero sin decimales'); ok = false; }
                  else {
                    const precioVal = Number(precio.value);
                    if (Number.isNaN(precioVal) || precioVal <= 0) { setFieldError(precio, precioErr, 'Ingrese un precio válido (> 0)'); ok = false; } 
                    else { setFieldError(precio, precioErr, ''); }
                  }
                  
                  // Validar que stock sea un número entero sin puntos ni comas
                  if (!stock.value.trim()) { setFieldError(stock, stockErr, 'Ingrese el stock'); ok = false; }
                  else if (!/^\d+$/.test(stock.value.trim())) { setFieldError(stock, stockErr, 'El stock debe ser un número entero sin puntos ni comas'); ok = false; }
                  else {
                    const stockVal = Number(stock.value);
                    if (Number.isNaN(stockVal) || stockVal < 0) { setFieldError(stock, stockErr, 'Ingrese stock válido (>= 0)'); ok = false; } 
                    else { setFieldError(stock, stockErr, ''); }
                  }
                  
                  // Validar imagen: obligatoria al crear, opcional al editar
                  if (!editandoProducto && !imagen.files[0]) {
                    setFieldError(imagen, imagenErr, 'Debe seleccionar una imagen para el producto');
                    ok = false;
                  } else if (imagen.files[0]) {
                    // Validar que sea una imagen real
                    const archivo = imagen.files[0];
                    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
                    const tamañoMaximo = 5 * 1024 * 1024; // 5MB
                    
                    if (!tiposPermitidos.includes(archivo.type)) {
                      setFieldError(imagen, imagenErr, 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP, AVIF)');
                      ok = false;
                    } else if (archivo.size > tamañoMaximo) {
                      setFieldError(imagen, imagenErr, 'La imagen no debe superar los 5MB');
                      ok = false;
                    } else {
                      setFieldError(imagen, imagenErr, '');
                    }
                  } else {
                    setFieldError(imagen, imagenErr, '');
                  }
                  
                  if (!ok) return;
                  
                  // Definir valores numéricos después de todas las validaciones
                  const precioVal = Number(precio.value);
                  const stockVal = Number(stock.value);
                  
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
                    
                    let errorMsg = 'Error al guardar producto';
                    
                    // Extraer mensaje del backend
                    if (err.response?.data) {
                      if (typeof err.response.data === 'string') {
                        errorMsg = err.response.data;
                      } else if (err.response.data.message) {
                        errorMsg = err.response.data.message;
                      } else if (err.response.data.error) {
                        errorMsg = err.response.data.error;
                      }
                    }
                    
                    // Si es error 403, es código duplicado
                    if (err.response?.status === 403) {
                      setFieldError(codigo, codigoErr, 'El código de producto ya existe');
                    } else {
                      setFieldError(nombre, nombreErr, errorMsg);
                    }
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="productCodigo" className="form-label">Código (máx. 10 caracteres)</label>
                    <input id="productCodigo" className="form-control" placeholder="ej: PROD001" maxLength="10" />
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
                    <label htmlFor="productPrecio" className="form-label">Precio (CLP)</label>
                    <input 
                      id="productPrecio" 
                      type="text" 
                      className="form-control" 
                      placeholder="ej: 15990"
                      onInput={(e) => {
                        // Solo permitir números enteros (sin puntos, comas, ni signos)
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                    <div id="productPrecioError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productStock" className="form-label">Stock</label>
                    <input 
                      id="productStock" 
                      type="text" 
                      className="form-control" 
                      defaultValue="0" 
                      onInput={(e) => {
                        // Solo permitir números enteros (sin puntos, comas, ni signos)
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                    <div id="productStockError" className="error-message text-danger small" style={{display:'none'}} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagen" className="form-label">Imagen {editandoProducto ? <small className="text-muted">(opcional - dejar vacío para mantener actual)</small> : '*'}</label>
                    <input id="productImagen" type="file" className="form-control" accept="image/*" />
                    <div id="productImagenError" className="error-message text-danger small" style={{display:'none'}} />
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
                        src={`${BASE_URL}${productoDetalle.imagenUrl}`} 
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
                  const imagenErr = form.querySelector('#marcaImagenError');
                  const success = form.parentElement.querySelector('#marcaSuccess');
                  if (success) success.style.display = 'none';
                  
                  if (!nombre.value.trim()) {
                    setFieldError(nombre, nombreErr, 'Ingrese el nombre de la marca');
                    return;
                  } else {
                    setFieldError(nombre, nombreErr, '');
                  }
                  
                  // Validar imagen obligatoria solo al crear nueva marca
                  if (!editandoMarca && !imagen.files[0]) {
                    setFieldError(imagen, imagenErr, 'Debe seleccionar una imagen para la marca');
                    return;
                  } else {
                    setFieldError(imagen, imagenErr, '');
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
                    <label htmlFor="marcaImagen" className="form-label">Imagen {editandoMarca ? <small className="text-muted">(opcional - dejar vacío para mantener actual)</small> : '*'}</label>
                    <input id="marcaImagen" type="file" className="form-control" accept="image/*" />
                    <div id="marcaImagenError" className="error-message text-danger small" style={{display:'none'}} />
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

        {/* Modal Detalle Mensaje */}
        <div className="modal fade" id="mensajeDetalleModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle del Mensaje</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                {mensajeDetalle && (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p><strong>Remitente:</strong> {mensajeDetalle.nombre}</p>
                        <p><strong>Email:</strong> {mensajeDetalle.email}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Fecha:</strong> {mensajeDetalle.fechaCreacion ? new Date(mensajeDetalle.fechaCreacion).toLocaleString('es-CL') : '-'}</p>
                        <p><strong>Estado:</strong> {getEstadoMensajeBadge(mensajeDetalle.estado)}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p><strong>Asunto:</strong> {getAsuntoBadge(mensajeDetalle.asunto)}</p>
                    </div>
                    <hr />
                    <div className="mb-3">
                      <h6 className="mb-2">Mensaje:</h6>
                      <div className="p-3 bg-light rounded" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                        {mensajeDetalle.mensaje}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                {mensajeDetalle && mensajeDetalle.estado === 'PENDIENTE' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleMarcarRespondido(mensajeDetalle.id)}
                  >
                    <i className="bi bi-check-circle" /> Marcar como Respondido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Admin;
