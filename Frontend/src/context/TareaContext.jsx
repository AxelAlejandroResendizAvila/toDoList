import { createContext, useState, useCallback, useEffect } from 'react';
import { tareaService } from '../services/tareaService';
import { seccionService } from '../services/seccionService';

export const TareaContext = createContext();

export const TareaProvider = ({ children }) => {
  const [tareas, setTareas] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las tareas de una sección
  const fetchTareas = useCallback(async (seccionId) => {
    if (!seccionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tareaService.getBySeccion(seccionId);
      setTareas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todas las secciones del usuario
  const fetchSecciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seccionService.getMisSecciones();
      setSecciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear tarea
  const createTarea = useCallback(async (tarea) => {
    try {
      const newTarea = await tareaService.create(tarea);
      setTareas([...tareas, newTarea]);
      return newTarea;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  // Actualizar tarea
  const updateTarea = useCallback(async (id, updates) => {
    try {
      const updated = await tareaService.update(id, updates);
      setTareas(tareas.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  // Eliminar tarea
  const deleteTarea = useCallback(async (id) => {
    try {
      await tareaService.delete(id);
      setTareas(tareas.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  // Crear sección
  const createSeccion = useCallback(async (seccion) => {
    try {
      const newSeccion = await seccionService.create(seccion);
      setSecciones([...secciones, newSeccion]);
      return newSeccion;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [secciones]);

  // Actualizar sección
  const updateSeccion = useCallback(async (id, updates) => {
    try {
      const updated = await seccionService.update(id, updates);
      setSecciones(secciones.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [secciones]);

  // Eliminar sección
  const deleteSeccion = useCallback(async (id) => {
    try {
      await seccionService.delete(id);
      setSecciones(secciones.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [secciones]);

  // Gestión de Colaboradores
  const getColaboradores = useCallback(async (seccionId) => {
    try {
      return await seccionService.getColaboradores(seccionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cambiarRol = useCallback(async (seccionId, colabId, rol) => {
    try {
      const result = await seccionService.cambiarRol(seccionId, colabId, rol);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Invitaciones (Ahora vía Código Permanente en Seccion)
  const aceptarInvitacion = useCallback(async (codigo) => {
    try {
      const result = await seccionService.unirseConCodigo(codigo);
      await fetchSecciones();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchSecciones]);

  const getCodigoInvitacion = useCallback(async (seccionId) => {
    try {
      return await seccionService.getCodigoInvitacion(seccionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const regenerarCodigoInvitacion = useCallback(async (seccionId) => {
    try {
      return await seccionService.regenerarCodigo(seccionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const asignarUsuarioATarea = useCallback(async (tareaId, correo) => {
    try {
      const updatedTarea = await tareaService.asignarUsuario(tareaId, correo);
      setTareas(tareas.map(t => t.id === tareaId ? updatedTarea : t));
      return updatedTarea;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  const asignarVariosATarea = useCallback(async (tareaId, correos) => {
    try {
      const updatedTarea = await tareaService.asignarVarios(tareaId, correos);
      setTareas(tareas.map(t => t.id === tareaId ? updatedTarea : t));
      return updatedTarea;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  const desasignarUsuarioDeTarea = useCallback(async (tareaId, correo) => {
    try {
      const updatedTarea = await tareaService.desasignarUsuario(tareaId, correo);
      setTareas(tareas.map(t => t.id === tareaId ? updatedTarea : t));
      return updatedTarea;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  const actualizarEstatusIndividual = useCallback(async (tareaId, estatus) => {
    try {
      const updatedTarea = await tareaService.actualizarEstatusIndividual(tareaId, estatus);
      setTareas(tareas.map(t => t.id === tareaId ? updatedTarea : t));
      return updatedTarea;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tareas]);

  return (
    <TareaContext.Provider
      value={{
        tareas,
        secciones,
        loading,
        error,
        fetchTareas,
        fetchSecciones,
        createTarea,
        updateTarea,
        deleteTarea,
        createSeccion,
        updateSeccion,
        deleteSeccion,
        getColaboradores,
        cambiarRol,
        aceptarInvitacion,
        getCodigoInvitacion,
        regenerarCodigoInvitacion,
        asignarUsuarioATarea,
        asignarVariosATarea,
        desasignarUsuarioDeTarea,
        actualizarEstatusIndividual,
      }}
    >
      {children}
    </TareaContext.Provider>
  );
};
