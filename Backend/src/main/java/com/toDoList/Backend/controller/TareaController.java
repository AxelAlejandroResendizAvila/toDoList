package com.toDoList.Backend.controller;

import com.toDoList.Backend.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.toDoList.Backend.service.TareaService;
import com.toDoList.Backend.service.SeccionService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TareaController {
    @Autowired
    private TareaService tareaService;

    @Autowired
    private SeccionService seccionService;

    // ==================== TAREAS ====================

    @GetMapping("/tareas")
    public List<Tarea> getAllTareas() {
        return tareaService.getAllTareas();
    }

    @GetMapping("/tareas/{id}")
    public ResponseEntity<?> getTareaById(@PathVariable("id") Long id) {
        return tareaService.getTareaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tareas")
    public ResponseEntity<?> createTarea(@RequestBody Tarea tarea) {
        try {
            if (tarea.getSeccion() == null || tarea.getSeccion().getId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "La tarea debe pertenecer a una sección"));
            }

            // Verificar permisos
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(tarea.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para crear tareas"));
            }

            return ResponseEntity.ok(tareaService.createTarea(tarea));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/tareas/{id}")
    public ResponseEntity<?> updateTarea(@PathVariable("id") Long id, @RequestBody Tarea tareaDetails) {
        try {
            Tarea existing = tareaService.getTareaById(id)
                    .orElseThrow(() -> new Exception("Tarea no encontrada"));

            // Verificar permisos
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(existing.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para modificar tareas"));
            }

            return ResponseEntity.ok(tareaService.updateTarea(id, tareaDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<?> deleteTarea(@PathVariable("id") Long id) {
        try {
            Tarea existing = tareaService.getTareaById(id)
                    .orElseThrow(() -> new Exception("Tarea no encontrada"));

            // Verificar permisos
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(existing.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para eliminar tareas"));
            }

            tareaService.deleteTarea(id);
            return ResponseEntity.ok(Map.of("message", "Tarea eliminada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // ==================== BÚSQUEDAS PERSONALIZA TAREAS ====================

    @GetMapping("/tareas/estatus/{estatus}")
    public List<Tarea> getTareasByEstatus(@PathVariable("estatus") String estatus) {
        return tareaService.getTareasByEstatus(estatus);
    }

    @GetMapping("/tareas/prioridad/{prioridad}")
    public List<Tarea> getTareasByPrioridad(@PathVariable("prioridad") Integer prioridad) {
        return tareaService.getTareasByPrioridad(prioridad);
    }

    // ==================== ASIGNACIONES ====================

    @PostMapping("/tareas/{id}/asignar")
    public ResponseEntity<?> asignarUsuario(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            String correo = payload.get("correo");
            // El service ya valida permisos de existencia, pero aquí verificamos acceso a la sección
            Tarea existing = tareaService.getTareaById(id)
                    .orElseThrow(() -> new Exception("Tarea no encontrada"));
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(existing.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para asignar tareas"));
            }

            return ResponseEntity.ok(tareaService.asignarUsuarioATarea(id, correo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/tareas/{id}/desasignar")
    public ResponseEntity<?> desasignarUsuario(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            String correo = payload.get("correo");
            Tarea existing = tareaService.getTareaById(id)
                    .orElseThrow(() -> new Exception("Tarea no encontrada"));
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(existing.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para desasignar tareas"));
            }

            return ResponseEntity.ok(tareaService.desasignarUsuarioDeTarea(id, correo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/tareas/{id}/asignar-masivo")
    public ResponseEntity<?> asignarVarios(@PathVariable("id") Long id, @RequestBody Map<String, List<String>> payload) {
        try {
            List<String> correos = payload.get("correos");
            Tarea existing = tareaService.getTareaById(id)
                    .orElseThrow(() -> new Exception("Tarea no encontrada"));
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(existing.getSeccion().getId(), auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para asignar tareas"));
            }

            return ResponseEntity.ok(tareaService.asignarVariosATarea(id, correos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/tareas/{id}/estatus-individual")
    public ResponseEntity<?> actualizarEstatusIndividual(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            String nuevoEstatus = payload.get("estatus");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            // Un usuario solo puede actualizar su propio estatus individual (o el Admin/Editor el de todos?)
            // El usuario pidió "cada usuario marca como completada", así que usamos el usuario autenticado
            return ResponseEntity.ok(tareaService.actualizarEstatusColaborador(id, auth.getName(), nuevoEstatus));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}