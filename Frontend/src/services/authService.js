import { apiCall } from '../config/api';

// Servicio para autenticación
export const authService = {
  // Registrar nuevo usuario
  register: async (nombre, correo, password, telefono = '') => {
    return apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, password, telefono }),
    });
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    return apiCall('/users/me');
  },

  // Login
  login: async (correo, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
    
    // Guardar el token en localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Obtener el token actual
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
