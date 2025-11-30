import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../assets/js/session';
import images from '../assets/js/images';
import { countItems, subscribeCart } from '../assets/js/carrito';

function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const user = getCurrentUser();
  const [cartCount, setCartCount] = useState(countItems());

  useEffect(() => {
    const unsubscribe = subscribeCart(setCartCount);
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  return (
    <header id="header" className="header sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src={images.logo} alt="Logo Visso" className="rounded-circle" style={{ height: 36, width: 36, objectFit: 'cover' }} />
            <span className="font-story-script">Visso</span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {isHome ? (
                <>
                  <li className="nav-item"><a className="nav-link active" href="#hero">Inicio</a></li>
                  <li className="nav-item"><a className="nav-link" href="#about">Nosotros</a></li>
                  <li className="nav-item"><a className="nav-link" href="#contacto">Contacto</a></li>
                </>
              ) : (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/#about">Nosotros</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/#contacto">Contacto</Link></li>
                </>
              )}
              <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
            </ul>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <Link className="btn-getstarted d-flex align-items-center gap-1 position-relative" to="/carrito">
                <i className="bi bi-cart" /> Carrito
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
              {!user ? (
                <Link className="btn-getstarted d-flex align-items-center gap-1" to="/auth">
                  <i className="bi bi-person" /> Ingresar
                </Link>
              ) : (
                <div className="dropdown">
                  <button className="btn btn-primary rounded-pill px-3 dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle" /> {user.nombre || 'Usuario'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {(user.rol === 'admin' || user.rol === 'ADMIN') && (
                      <li><Link className="dropdown-item" to="/admin"><i className="bi bi-gear" /> Panel Admin</Link></li>
                    )}
                    <li><Link className="dropdown-item" to="/productos"><i className="bi bi-shop" /> Tienda</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={() => { logout(); window.location.href = '/'; }}>
                        <i className="bi bi-box-arrow-right" /> Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;