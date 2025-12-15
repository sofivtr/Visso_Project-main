import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/css/main.css';
import './assets/css/style.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
<BrowserRouter>
<App />
</BrowserRouter>
);