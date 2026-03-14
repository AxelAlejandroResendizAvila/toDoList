import { apiCall } from '../config/api';

// Servicio para CRUD de Tareas
export const tareaService = {
  // Obtener tareas por sección
  getBySeccion: async (seccionId) => {
    return apiCall(`/secciones/${seccionId}/tareas`);
  },

  // Obtener una tarea por ID
  getById: async (id) => {
    return apiCall(`/tareas/${id}`);
  },

  // Crear nueva tarea
  create: async (tarea) => {
    return apiCall('/tareas', {
      method: 'POST',
      body: JSON.stringify(tarea),
    });
  },

  // Actualizar tarea
  update: async (id, tarea) => {
    return apiCall(`/tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tarea),
    });
  },

  // Eliminar tarea
  delete: async (id) => {
    return apiCall(`/tareas/${id}`, {
      method: 'DELETE',
    });
  },

  // Asignar un colaborador a una tarea
  asignarUsuario: async (tareaId, correo) => {
    return apiCall(`/tareas/${tareaId}/asignar`, {
      method: 'POST',
      body: JSON.stringify({ correo }),
    });
  },

  // Desasignar un colaborador de una tarea
  desasignarUsuario: async (tareaId, correo) => {
    return apiCall(`/tareas/${tareaId}/desasignar`, {
      method: 'DELETE',
      body: JSON.stringify({ correo }),
    });
  },

  // Actualizar el estatus individual de un colaborador en una tarea
  actualizarEstatusIndividual: async (tareaId, estatus) => {
    return apiCall(`/tareas/${tareaId}/estatus-individual`, {
      method: 'PUT',
      body: JSON.stringify({ estatus }),
    });
  },

  // Asignar varios usuarios a la vez (Carga masiva para una tarea existente)
  asignarVarios: async (tareaId, correos) => {
    return apiCall(`/tareas/${tareaId}/asignar-masivo`, {
      method: 'POST',
      body: JSON.stringify({ correos }),
    });
  },
};
