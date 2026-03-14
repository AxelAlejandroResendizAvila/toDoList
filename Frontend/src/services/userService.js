import { apiCall } from '../config/api';

// Servicio para CRUD de Usuarios
export const userService = {
  // Obtener todos los usuarios (solo admin)
  getAll: async () => {
    return apiCall('/users');
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    return apiCall(`/users/${id}`);
  },

  // Obtener perfil detallado (incluye secciones compartidas)
  getProfile: async (id) => {
    return apiCall(`/users/${id}/profile`);
  },

  // Obtener el perfil del usuario actual
  getCurrentUser: async () => {
    return apiCall('/users/me');
  },

  // Actualizar usuario
  update: async (id, usuario) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  },

  // Eliminar usuario
  delete: async (id) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
