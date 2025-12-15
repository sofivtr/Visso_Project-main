import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/Header';
import Productos from './components/Productos';
import Footer from './components/Footer';
import Carrito from './components/Carrito';
import Auth from './components/Auth';
import Admin from './components/Admin';
import Vendedor from './components/Vendedor';
import ResultadoCompra from './components/ResultadoCompra';
import { getCurrentUser } from './assets/js/session';

// Importamos los nuevos componentes para las rutas
import Nosotros from './components/Nosotros';
import Contacto from './components/Contacto';

function App() {
  const { pathname } = useLocation();

  // Scroll al inicio cada vez que cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header/>
      <Routes>
         <Route path='/' element={<Home />} />
         <Route path='/productos' element={<Productos />} />
         
         {/* Nuevas rutas agregadas */}
         <Route path='/nosotros' element={<Nosotros />} />
         <Route path='/contacto' element={<Contacto />} />

         <Route path='/carrito' element={<Carrito />} />
         <Route path='/resultado-compra' element={<ResultadoCompra />} />
         <Route path='/auth' element={<Auth />} />
         
         <Route path='/admin' element={(() => {
           const u = getCurrentUser();
           if (!u) return <Auth />; 
           if (u.rol !== 'admin' && u.rol !== 'ADMIN') return <Home />; 
           return <Admin />;
         })()} />
         
         <Route path='/vendedor' element={(() => {
           const u = getCurrentUser();
           if (!u) return <Auth />; 
           if (u.rol !== 'vendedor' && u.rol !== 'VENDEDOR') return <Home />; 
           return <Vendedor />;
         })()} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App