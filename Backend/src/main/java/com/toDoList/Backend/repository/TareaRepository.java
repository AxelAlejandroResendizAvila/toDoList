package com.toDoList.Backend.repository;
import com.toDoList.Backend.model.Tarea;
import com.toDoList.Backend.model.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    // BÚSQUEDAS PERSONALIZADAS
    
    /**
     * Encuentra todas las tareas con un estatus específico
     * SQL: SELECT * FROM tareas WHERE estatus = ?
     * @param estatus PENDIENTE, EN_PROCESO, COMPLETADA
     */
    List<Tarea> findByEstatus(String estatus);
    
    /**
     * Encuentra todas las tareas de una sección
     * SQL: SELECT * FROM tareas WHERE seccion_id = ?
     */
    List<Tarea> findBySeccion(Seccion seccion);
    
    List<Tarea> findBySeccionId(Long seccionId);
    
    /**
     * Encuentra todas las tareas con una prioridad específica
     * SQL: SELECT * FROM tareas WHERE prioridad = ?
     * @param prioridad 1 (Alta), 2 (Media), 3 (Baja)
     */
    List<Tarea> findByPrioridad(Integer prioridad);
}