import axios from 'axios';

// Configuración de la URL del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT automáticamente a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (ej: token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir automáticamente en errores 401, dejar que el componente maneje el error
    // Solo limpiar el storage si es necesario
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      // Solo limpiar token si NO es el endpoint de login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API principal con axios
export const Api = {
  // ===== PRODUCTOS =====
  products: async () => {
    const { data } = await apiClient.get('/productos');
    return data;
  },
  
  getProduct: async (id) => {
    const { data } = await apiClient.get(`/productos/${id}`);
    return data;
  },
  
  createProduct: async (formData) => {
    const { data } = await apiClient.post('/productos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  
  updateProduct: async (id, formData) => {
    const { data } = await apiClient.put(`/productos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  
  deleteProduct: async (id) => {
    await apiClient.delete(`/productos/${id}`);
  },

  // ===== USUARIOS =====
  users: async () => {
    const { data } = await apiClient.get('/usuarios');
    return data;
  },
  
  getUser: async (id) => {
    const { data } = await apiClient.get(`/usuarios/${id}`);
    return data;
  },
  
  updateUser: async (id, userData) => {
    const { data } = await apiClient.put(`/usuarios/${id}`, userData);
    return data;
  },
  
  deleteUser: async (id) => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  // ===== AUTENTICACIÓN =====
  login: async (credenciales) => {
    const { data } = await apiClient.post('/auth/login', credenciales);
    // Por ahora el backend solo retorna el usuario (sin JWT)
    // Cuando se implemente JWT, retornará { token, usuario }
    return data;
  },
  
  register: async (userData) => {
    const { data } = await apiClient.post('/auth/registro', userData);
    return data;
  },
  
  createUser: async (userData) => {
    const { data } = await apiClient.post('/usuarios', userData);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ===== CATEGORÍAS =====
  categories: async () => {
    const { data } = await apiClient.get('/categorias');
    return data;
  },
  
  getCategory: async (id) => {
    const { data } = await apiClient.get(`/categorias/${id}`);
    return data;
  },
  
  createCategory: async (categoriaData) => {
    const { data } = await apiClient.post('/categorias', categoriaData);
    return data;
  },
  
  updateCategory: async (id, categoriaData) => {
    const { data } = await apiClient.put(`/categorias/${id}`, categoriaData);
    return data;
  },
  
  deleteCategory: async (id) => {
    await apiClient.delete(`/categorias/${id}`);
  },

  // ===== MARCAS =====
  brands: async () => {
    const { data } = await apiClient.get('/marcas');
    return data;
  },
  
  getBrand: async (id) => {
    const { data } = await apiClient.get(`/marcas/${id}`);
    return data;
  },
  
  createBrand: async (formData) => {
    const { data } = await apiClient.post('/marcas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  
  updateBrand: async (id, formData) => {
    const { data } = await apiClient.put(`/marcas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  
  deleteBrand: async (id) => {
    await apiClient.delete(`/marcas/${id}`);
  },

  // ===== COTIZACIONES =====
  createCotizacion: async (cotizacionData) => {
    const { data } = await apiClient.post('/cotizaciones', cotizacionData);
    return data;
  },

  getCotizaciones: async (usuarioId) => {
    const { data } = await apiClient.get(`/cotizaciones/usuario/${usuarioId}`);
    return data;
  },

  // ===== CARRITO =====
  getCarrito: async (usuarioId) => {
    const { data } = await apiClient.get(`/carrito/${usuarioId}`);
    return data;
  },
  
  addToCarrito: async (solicitud) => {
    // solicitud debe tener: { usuarioId, productoId, cantidad, cotizacionId (opcional) }
    const { data } = await apiClient.post('/carrito/agregar', solicitud);
    return data;
  },
  
  updateCarritoItem: async (detalleId, cantidad) => {
    const { data } = await apiClient.put(`/carrito/detalle/${detalleId}`, { cantidad });
    return data;
  },
  
  removeFromCarrito: async (detalleId) => {
    await apiClient.delete(`/carrito/detalle/${detalleId}`);
  },
  
  clearCarrito: async (usuarioId) => {
    await apiClient.delete(`/carrito/${usuarioId}/limpiar`);
  },
  
  cerrarCarrito: async (usuarioId) => {
    const { data } = await apiClient.post(`/carrito/cerrar/${usuarioId}`);
    return data;
  },
  
  getPedidos: async () => {
    const { data } = await apiClient.get('/carrito/ventas');
    return data;
  },

  // ===== REGIONES Y COMUNAS (mantener local) =====
  regionesComunas: async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}regionesComunas.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status} al cargar regiones`);
    return res.json();
  },
};
