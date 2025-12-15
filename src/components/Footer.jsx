import { Link } from 'react-router-dom';
import images from '../assets/js/images';

function Footer() {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 mb-4">
            <h5 className="mb-3">
              <i className="fas fa-eye" /> Visso Óptica
            </h5>
            <p className="mb-4">Tu visión es nuestra prioridad. Ofrecemos productos y servicios de calidad superior para cuidar tu salud visual.</p>
            <img src={images.logo_mod || images.logo} alt="Logo Visso" className="rounded-circle mb-3" style={{height: 64, width: 64, objectFit: 'cover'}} />
          </div>
          
          <div className="col-lg-3 mb-4">
            <h6 className="mb-3">Enlaces</h6>
            <ul className="list-unstyled">
              {/* === CORRECCIÓN AQUÍ: Links internos a los componentes === */}
              <li><Link to="/" className="text-white-50 text-decoration-none">Inicio</Link></li>
              <li><Link to="/productos" className="text-white-50 text-decoration-none">Productos</Link></li>
              <li><Link to="/nosotros" className="text-white-50 text-decoration-none">Nosotros</Link></li>
              <li><Link to="/contacto" className="text-white-50 text-decoration-none">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-4 mb-4">
            <h6 className="mb-3">Servicios</h6>
            <ul className="list-unstyled">
              {/* Extra: También hice clickeables los servicios para llevar a la categoría correcta */}
              <li><Link to="/productos?categoria=Opticos" className="text-white-50 text-decoration-none">Lentes Oftálmicos</Link></li>
              <li><Link to="/productos?categoria=Lentes%20de%20sol" className="text-white-50 text-decoration-none">Gafas de Sol</Link></li>
              <li><Link to="/productos?categoria=Lentes%20de%20contacto" className="text-white-50 text-decoration-none">Lentes de Contacto</Link></li>
              <li><Link to="/productos?categoria=Accesorios" className="text-white-50 text-decoration-none">Accesorios</Link></li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4 border-secondary" />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-white-50 mb-0">© 2025 Visso Óptica. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;