import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Importamos esto para leer la URL
import { Api } from '../assets/js/api';
import { getImageUrl } from '../assets/js/imageUtils';
import { getCurrentUser } from '../assets/js/session';
import { addItem as cartAdd } from '../assets/js/carrito';

function formatCLP(value) {
  try { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value); } catch { return `$${value}`; }
}

const PRECIOS_TRATAMIENTOS = {
  antirreflejo: 15000,
  filtroAzul: 20000,
  fotocromático: 25000, 
};

function calcularPrecioCotizacion(precioBase, cotizacionData) {
  let total = precioBase;
  if (cotizacionData.antirreflejo) total += PRECIOS_TRATAMIENTOS.antirreflejo;
  if (cotizacionData.filtroAzul) total += PRECIOS_TRATAMIENTOS.filtroAzul;
  if (cotizacionData.tipoCristal === 'Fotocromático') {
    total += PRECIOS_TRATAMIENTOS.fotocromático;
  }
  return total;
}

function Productos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hook para leer parámetros de la URL (?marca=RayBan o ?categoria=Sol)
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState('todos');
  const [brand, setBrand] = useState('todos');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [cotizacionData, setCotizacionData] = useState({
    nombrePaciente: '',
    fechaReceta: '',
    gradoOd: '',
    gradoOi: '',
    tipoLente: 'Monofocal',
    tipoCristal: 'Blanco',
    antirreflejo: false,
    filtroAzul: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          Api.products(),
          Api.categories(),
          Api.brands(),
        ]);
        if (mounted) {
          setProducts(Array.isArray(productsData) ? productsData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setBrands(Array.isArray(brandsData) ? brandsData : []);

          // === LÓGICA DE FILTRADO AUTOMÁTICO DESDE URL ===
          const urlCategory = searchParams.get('categoria');
          const urlBrand = searchParams.get('marca');

          if (urlCategory) {
              setCategory(urlCategory);
          }
          if (urlBrand) {
              setBrand(urlBrand);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setProducts([]);
          setCategories([]);
          setBrands([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [searchParams]); // Agregamos searchParams como dependencia

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(p => {
      const matchCategory = category === 'todos' || 
        (p.categoria && p.categoria.nombre === category);
      
      const matchBrand = brand === 'todos' || 
        (p.marca && p.marca.nombre === brand);
      
      const matchSearch = !term || (p.nombre || '').toLowerCase().includes(term);
      
      return matchCategory && matchBrand && matchSearch;
    });
  }, [products, category, brand, search]);

  const openModal = (p) => {
    setSelected(p);
    setQty(1);
    const esOptica = p.categoria?.nombre?.toUpperCase() === 'ÓPTICA' || 
                     p.categoria?.nombre?.toUpperCase() === 'OPTICA' ||
                     p.categoria?.nombre?.toUpperCase() === 'OPTICOS';
    setShowCotizacion(esOptica);
    setCotizacionData({
      nombrePaciente: '',
      fechaReceta: '',
      gradoOd: '',
      gradoOi: '',
      tipoLente: 'Monofocal',
      tipoCristal: 'Blanco',
      antirreflejo: false,
      filtroAzul: false,
    });
  };
  
  const changeQuantity = (d) => {
    if (!selected) return;
    const maxStock = selected.stock || 0;
    setQty(prev => Math.max(1, Math.min(maxStock, prev + d)));
  };
  
  const addToCartFromModal = async () => {
    if (!selected) return;
    
    const usuario = getCurrentUser();
    if (!usuario || !usuario.id) {
      alert('Debe iniciar sesión para agregar productos al carrito');
      return;
    }

    if (selected.stock === 0) {
      alert('No hay stock disponible de este producto');
      return;
    }
    
    if (qty > selected.stock) {
      alert(`Solo hay ${selected.stock} unidad(es) disponible(s) de este producto`);
      return;
    }

    try {
      let cotizacionId = null;

      if (showCotizacion) {
        if (!cotizacionData.nombrePaciente || !cotizacionData.fechaReceta) {
          alert('Por favor complete el nombre del paciente y la fecha de la receta');
          return;
        }

        const precioTotal = calcularPrecioCotizacion(selected.precio, cotizacionData);

        const cotizacion = await Api.createCotizacion({
          usuario: { id: usuario.id },
          producto: { id: selected.id },
          nombrePaciente: cotizacionData.nombrePaciente,
          fechaReceta: cotizacionData.fechaReceta,
          gradoOd: cotizacionData.gradoOd ? parseFloat(cotizacionData.gradoOd) : null,
          gradoOi: cotizacionData.gradoOi ? parseFloat(cotizacionData.gradoOi) : null,
          tipoLente: cotizacionData.tipoLente,
          tipoCristal: cotizacionData.tipoCristal,
          antirreflejo: cotizacionData.antirreflejo,
          filtroAzul: cotizacionData.filtroAzul,
          valorAprox: precioTotal, 
        });
        
        cotizacionId = cotizacion.id;
      }

      await Api.addToCarrito({
        usuarioId: usuario.id,
        productoId: selected.id,
        cantidad: qty,
        cotizacionId: cotizacionId,
      });

      cartAdd({
        id: selected.id,
        nombre: selected.nombre,
        categoria: selected.categoria?.nombre || 'Sin categoría',
        precio: selected.precio,
        imagenUrl: selected.imagenUrl,
        cotizacionId: cotizacionId,
      }, qty);
      
      const modal = document.getElementById('productModal');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close');
        if (closeButton) closeButton.click();
      }
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      const mensaje = error.response?.data?.message || error.message;
      if (error.response?.status === 400 && (mensaje.toLowerCase().includes('stock') || mensaje.toLowerCase().includes('disponible'))) {
        alert(mensaje);
      } else {
        alert('Error al agregar el producto al carrito: ' + mensaje);
      }
    }
  };

  return (
    <main className="main">
      <section className="page-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="fw-bold mb-3" id="titulo_tienda">Nuestros Productos</h1>
              <p className="lead mb-0">Descubre la colección más exclusiva de lentes y gafas de sol</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="filters-section">
          <div className="row align-items-center">
            <div className="col-md-4 mb-3">
              <h5 className="mb-3">Filtrar por categoría:</h5>
              <button
                className={`filter-btn btn btn-outline-dark me-2 mb-2 ${category === 'todos' ? 'active' : ''}`}
                onClick={() => setCategory('todos')}
                type="button"
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn btn btn-outline-dark me-2 mb-2 ${category === cat.nombre ? 'active' : ''}`}
                  onClick={() => setCategory(cat.nombre)}
                  type="button"
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="mb-3">Filtrar por marca:</h5>
              <select 
                className="form-select" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="todos">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="mb-3">Buscar producto:</h5>
              <input
                type="text"
                className="form-control search-box"
                placeholder="Buscar lentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row" id="productsContainer">
          {loading && <div className="col-12 text-center py-5">Cargando productos…</div>}
          {!loading && filtered.length === 0 && (
            <div className="col-12 text-center text-muted py-5">No hay productos que coincidan</div>
          )}
          {!loading && filtered.map((p) => (
            <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={p.id}>
              <div className="card h-100 shadow-sm">
                <img src={getImageUrl(p.imagenUrl)} className="card-img-top" alt={p.nombre} style={{ objectFit: 'contain', height: 180 }} />
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-light text-dark align-self-start mb-2">{p.categoria?.nombre || 'Sin categoría'}</span>
                  <h5 className="card-title mb-1">{p.nombre}</h5>
                  <p className="card-text text-muted mb-3" style={{ minHeight: 40 }}>{p.descripcion}</p>
                  <div className="mt-auto d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-primary">{formatCLP(p.precio)}</span>
                    <button
                      className="btn btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#productModal"
                      onClick={() => openModal(p)}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modal fade" id="productModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitle">{selected ? selected.nombre : 'Detalles del Producto'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="product-gallery">
                    <img
                      id="modalImage"
                      src={selected ? getImageUrl(selected.imagenUrl) : ''}
                      alt={selected ? selected.nombre : 'Producto'}
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="mb-2">
                    <span className="badge bg-light text-dark me-2" id="modalCategory">{selected ? (selected.categoria?.nombre || 'Sin categoría') : ''}</span>
                    <span className="badge bg-primary" id="modalBrand">{selected ? (selected.marca?.nombre || 'Sin marca') : ''}</span>
                  </div>
                  <h3 className="mt-3 mb-3" id="modalProductTitle">{selected ? selected.nombre : ''}</h3>
                  <p className="text-muted mb-3" id="modalDescription">{selected ? selected.descripcion : ''}</p>
                  <div className="d-flex align-items-center mb-2">
                    <h4 className="product-price mb-0" id="modalPrice">{selected ? formatCLP(selected.precio) : ''}</h4>
                  </div>
                  <div className="mb-3">
                    {selected && selected.stock === 0 && (
                      <span className="badge bg-danger">Sin stock disponible</span>
                    )}
                    {selected && selected.stock > 0 && selected.stock <= 5 && (
                      <span className="badge bg-warning text-dark">Solo quedan {selected.stock} unidad(es)</span>
                    )}
                    {selected && selected.stock > 5 && (
                      <span className="badge bg-success">Stock disponible: {selected.stock}</span>
                    )}
                  </div>
                  
                  {!showCotizacion && (
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => changeQuantity(-1)} disabled={!selected || selected.stock === 0}><i className="bi bi-dash" /></button>
                        <span className="fw-semibold px-3">{qty}</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => changeQuantity(1)} disabled={!selected || selected.stock === 0}><i className="bi bi-plus" /></button>
                      </div>
                      <button className="btn btn-primary flex-grow-1" onClick={addToCartFromModal} disabled={!selected || selected.stock === 0}>
                        <i className="bi bi-cart-plus me-2" />
                        {selected && selected.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

                  {showCotizacion && (
                    <div className="cotizacion-form mb-4 p-4 border rounded bg-light">
                      <h5 className="mb-3">
                        <i className="bi bi-clipboard-data me-2"></i>
                        Información para Cotización de Lentes
                      </h5>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Nombre del Paciente *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={cotizacionData.nombrePaciente}
                            onChange={(e) => setCotizacionData({...cotizacionData, nombrePaciente: e.target.value})}
                            placeholder="Nombre completo"
                            required
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Fecha de Receta *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={cotizacionData.fechaReceta}
                            onChange={(e) => setCotizacionData({...cotizacionData, fechaReceta: e.target.value})}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Graduación Ojo Derecho (OD)</label>
                          <input
                            type="number"
                            step="0.25"
                            className="form-control"
                            value={cotizacionData.gradoOd}
                            onChange={(e) => setCotizacionData({...cotizacionData, gradoOd: e.target.value})}
                            placeholder="Ej: -2.00"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Graduación Ojo Izquierdo (OI)</label>
                          <input
                            type="number"
                            step="0.25"
                            className="form-control"
                            value={cotizacionData.gradoOi}
                            onChange={(e) => setCotizacionData({...cotizacionData, gradoOi: e.target.value})}
                            placeholder="Ej: -1.75"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Tipo de Lente</label>
                          <select
                            className="form-select"
                            value={cotizacionData.tipoLente}
                            onChange={(e) => setCotizacionData({...cotizacionData, tipoLente: e.target.value})}
                          >
                            <option value="Monofocal">Monofocal</option>
                            <option value="Bifocal">Bifocal</option>
                            <option value="Progresivo">Progresivo</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Tipo de Cristal</label>
                          <div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="tipoCristal"
                                id="cristalBlanco"
                                value="Blanco"
                                checked={cotizacionData.tipoCristal === 'Blanco'}
                                onChange={(e) => setCotizacionData({...cotizacionData, tipoCristal: e.target.value})}
                              />
                              <label className="form-check-label" htmlFor="cristalBlanco">
                                Blanco (Transparente) - Sin costo adicional
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="tipoCristal"
                                id="cristalFoto"
                                value="Fotocromático"
                                checked={cotizacionData.tipoCristal === 'Fotocromático'}
                                onChange={(e) => setCotizacionData({...cotizacionData, tipoCristal: e.target.value})}
                              />
                              <label className="form-check-label" htmlFor="cristalFoto">
                                Fotocromático <span className="text-primary fw-bold">(+{formatCLP(PRECIOS_TRATAMIENTOS.fotocromático)})</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold">Tratamientos Adicionales</label>
                          <div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="antirreflejo"
                                checked={cotizacionData.antirreflejo}
                                onChange={(e) => setCotizacionData({...cotizacionData, antirreflejo: e.target.checked})}
                              />
                              <label className="form-check-label" htmlFor="antirreflejo">
                                Antirreflejo <span className="text-primary fw-bold">(+{formatCLP(PRECIOS_TRATAMIENTOS.antirreflejo)})</span>
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="filtroAzul"
                                checked={cotizacionData.filtroAzul}
                                onChange={(e) => setCotizacionData({...cotizacionData, filtroAzul: e.target.checked})}
                              />
                              <label className="form-check-label" htmlFor="filtroAzul">
                                Filtro Luz Azul <span className="text-primary fw-bold">(+{formatCLP(PRECIOS_TRATAMIENTOS.filtroAzul)})</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="alert alert-info d-flex justify-content-between align-items-center">
                            <span><strong>Precio Total Cotizado:</strong></span>
                            <span className="fs-5 fw-bold text-primary">
                              {selected && formatCLP(calcularPrecioCotizacion(selected.precio, cotizacionData))}
                            </span>
                          </div>
                        </div>

                        <div className="col-12">
                          <small className="text-muted">
                            * Campos obligatorios. La cotización se asociará a este producto en su carrito.
                          </small>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        {selected && selected.stock === 0 && (
                          <div className="alert alert-danger mb-0">Sin stock disponible</div>
                        )}
                        {selected && selected.stock > 0 && selected.stock <= 5 && (
                          <div className="alert alert-warning mb-0">Solo quedan {selected.stock} unidad(es)</div>
                        )}
                      </div>
                      
                      <div className="d-flex align-items-center gap-3 mt-3">
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => changeQuantity(-1)} disabled={!selected || selected.stock === 0}><i className="bi bi-dash" /></button>
                          <span className="fw-semibold px-3">{qty}</span>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => changeQuantity(1)} disabled={!selected || selected.stock === 0}><i className="bi bi-plus" /></button>
                        </div>
                        <button className="btn btn-primary flex-grow-1" onClick={addToCartFromModal} disabled={!selected || selected.stock === 0}>
                          <i className="bi bi-cart-plus me-2" />
                          {selected && selected.stock === 0 ? 'Sin stock' : 'Agregar Cotización al Carrito'}
                        </button>
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
    </main>
  );
}

export default Productos;