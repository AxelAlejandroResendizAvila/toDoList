import { apiCall } from '../config/api';

// Servicio para CRUD de Secciones
export const seccionService = {
  // Obtener secciones del usuario actual (vía JWT)
  getMisSecciones: async () => {
    return apiCall('/secciones/me');
  },

  // Obtener una sección por ID
  getById: async (id) => {
    return apiCall(`/secciones/${id}`);
  },

  // Crear nueva sección
  create: async (seccion) => {
    return apiCall('/secciones', {
      method: 'POST',
      body: JSON.stringify(seccion),
    });
  },

  // Actualizar sección
  update: async (id, seccion) => {
    return apiCall(`/secciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(seccion),
    });
  },

  // Eliminar sección
  delete: async (id) => {
    return apiCall(`/secciones/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener colaboradores de una sección
  getColaboradores: async (id) => {
    return apiCall(`/secciones/${id}/colaboradores`);
  },

  // Cambiar rol de un colaborador
  cambiarRol: async (seccionId, colabId, rol) => {
    return apiCall(`/secciones/${seccionId}/colaboradores/${colabId}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol }),
    });
  },

  // Obtener el código permanente de invitación de la sección
  getCodigoInvitacion: async (id) => {
    return apiCall(`/secciones/${id}/codigo`);
  },

  // Regenerar el código de invitación
  regenerarCodigo: async (id) => {
    return apiCall(`/secciones/${id}/codigo`, {
      method: 'POST'
    });
  },
 
  // Unirse a una sección mediante código
  unirseConCodigo: async (codigo) => {
    return apiCall('/secciones/unirse', {
      method: 'POST',
      body: JSON.stringify({ codigo }),
    });
  },
};
