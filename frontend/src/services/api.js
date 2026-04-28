import axios from 'axios';

// Instancia configurada de Axios para comunicarse con Django
const api = axios.create({
  // Asegúrate de cambiar este puerto al que use tu servidor de Django (usualmente 8000)
  baseURL: 'http://localhost:8000/api/', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para añadir tokens de autenticación si existen
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
