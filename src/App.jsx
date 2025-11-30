import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/Header';
import Productos from './components/Productos';
import Footer from './components/Footer';
import Carrito from './components/Carrito';
import Auth from './components/Auth';
import Admin from './components/Admin';
import ResultadoCompra from './components/ResultadoCompra';
import { getCurrentUser } from './assets/js/session';
//import React from 'react';


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
        <Route path='/carrito' element={<Carrito />} />
        <Route path='/resultado' element={<ResultadoCompra />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/admin' element={(() => {
          const u = getCurrentUser();
          if (!u) return <Auth />; 
          if (u.rol !== 'admin' && u.rol !== 'ADMIN') return <Home />; 
          return <Admin />;
        })()} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App


//html -> react
//backend a aws
//html to JSX
//pensar en lo que no se va a mover de nuestro proyecto.