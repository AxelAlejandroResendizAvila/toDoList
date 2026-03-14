package com.toDoList.Backend.controller;

import com.toDoList.Backend.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.toDoList.Backend.service.SeccionService;
import com.toDoList.Backend.service.TareaService;
import com.toDoList.Backend.repository.SeccionUsuarioRepository;
import com.toDoList.Backend.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SeccionController {

    @Autowired
    private SeccionService seccionService;
    @Autowired
    private TareaService tareaService;
    @Autowired
    private SeccionUsuarioRepository seccionUsuarioRepo;
    @Autowired
    private UserRepository userRepo;

    // ==================== SECCIONES ====================

    @GetMapping("/secciones")
    public List<Seccion> getAllSecciones() {
        return seccionService.getAllSecciones();
    }

    @GetMapping("/secciones/{id}")
    public ResponseEntity<?> getSeccionById(@PathVariable("id") Long id) {
        return seccionService.getSeccionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/secciones")
    public ResponseEntity<?> createSeccion(@RequestBody Seccion seccion) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ResponseEntity.ok(seccionService.createSeccion(seccion, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/secciones/{id}")
    public ResponseEntity<?> updateSeccion(@PathVariable("id") Long id, @RequestBody Seccion seccionDetails) {
        try {
            return ResponseEntity.ok(seccionService.updateSeccion(id, seccionDetails));
        } catch (Exception e) {
            if (e.getMessage().equals("Sección no encontrada")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/secciones/{id}")
    public ResponseEntity<?> deleteSeccion(@PathVariable("id") Long id) {
        try {
            seccionService.deleteSeccion(id);
            return ResponseEntity.ok(Map.of("message", "Sección eliminada correctamente"));
        } catch (Exception e) {
            if (e.getMessage().equals("Sección no encontrada")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // ==================== BÚSQUEDAS PERSONALIZADAS ====================

    @GetMapping("/secciones/me")
    public List<Map<String, Object>> getMySecciones() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<SeccionUsuario> memberships = seccionUsuarioRepo.findByUsuario(
                userRepo.findByCorreo(auth.getName())
        );
        return memberships.stream().map(m -> {
            Seccion s = m.getSeccion();
            java.util.Map<String, Object> dto = new java.util.LinkedHashMap<>();
            dto.put("id", s.getId());
            dto.put("nombre", s.getNombre());
            dto.put("descripcion", s.getDescripcion());
            dto.put("tiempoAsignadoMinutos", s.getTiempoAsignadoMinutos());
            dto.put("fechaCreacion", s.getFechaCreacion());
            dto.put("tiempoRestante", s.getTiempoRestante());
            dto.put("rol", m.getRol().name()); // <-- EL ROL DEL USUARIO en esta sección
            
            // Añadir resumen de colaboradores
            List<Map<String, String>> colabs = s.getColaboradores().stream().map(cu -> {
                Map<String, String> cMap = new java.util.HashMap<>();
                cMap.put("id", cu.getUsuario().getId().toString());
                cMap.put("nombre", cu.getUsuario().getNombre());
                cMap.put("rol", cu.getRol().name());
                return cMap;
            }).toList();
            dto.put("colaboradores", colabs);

            return dto;
        }).toList();
    }

    @GetMapping("/secciones/{id}/tareas")
    public ResponseEntity<?> getTareasBySeccion(@PathVariable("id") Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // Verificar que sea colaborador
            if (!seccionService.getMembership(id, auth.getName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No tienes acceso a esta sección"));
            }

            if (!seccionService.getSeccionById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            List<Tarea> tareas = tareaService.getTareasBySeccionId(id);
            return ResponseEntity.ok(tareas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al obtener tareas: " + e.getMessage()));
        }
    }

    @GetMapping("/secciones/{id}/rol")
    public ResponseEntity<?> getRolEnSeccion(@PathVariable("id") Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return seccionService.getMembership(id, auth.getName())
                .map(m -> ResponseEntity.ok(Map.of("rol", m.getRol())))
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @GetMapping("/secciones/{id}/codigo")
    public ResponseEntity<?> getCodigoInvitacion(@PathVariable("id") Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(id, auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            // Si es Lector, no puede ver el código
            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Como LECTOR no puedes ver el código de invitación"));
            }

            String codigo = seccionService.getOrGenerateCodigoInvitacion(id);
            return ResponseEntity.ok(Map.<String, Object>of("codigo", codigo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/secciones/{id}/codigo")
    public ResponseEntity<?> regenerarCodigoInvitacion(@PathVariable("id") Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario membership = seccionService.getMembership(id, auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso a esta sección"));

            // Solo admins y editores pueden regenerar el código
            if (membership.getRol() == Rol.LECTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "No tienes permisos para regenerar el código"));
            }

            String nuevoCodigo = seccionService.regenerarCodigoInvitacion(id);
            return ResponseEntity.ok(Map.<String, Object>of("codigo", nuevoCodigo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/secciones/{id}/colaboradores")
    public ResponseEntity<?> getColaboradores(@PathVariable("id") Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // Solo colaboradores pueden ver la lista
            if (!seccionService.getMembership(id, auth.getName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Seccion seccion = seccionService.getSeccionById(id)
                    .orElseThrow(() -> new Exception("Sección no encontrada"));

            // Retornamos DTO compatible con lo que el frontend espera para asignaciones
            List<Map<String, Object>> colabs = seccionUsuarioRepo.findBySeccion(seccion).stream()
                    .map(c -> {
                        Map<String, Object> colabMap = new java.util.HashMap<>();
                        colabMap.put("id", c.getId());
                        colabMap.put("rol", c.getRol());
                        
                        Map<String, Object> userMap = new java.util.HashMap<>();
                        userMap.put("id", c.getUsuario().getId());
                        userMap.put("nombre", c.getUsuario().getNombre());
                        userMap.put("correo", c.getUsuario().getCorreo());
                        
                        colabMap.put("usuario", userMap);
                        return colabMap;
                    })
                    .toList();

            return ResponseEntity.ok(colabs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/secciones/{seccionId}/colaboradores/{colabId}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable("seccionId") Long seccionId,
            @PathVariable("colabId") Long colabId, @RequestBody Map<String, String> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            SeccionUsuario adminMembership = seccionService.getMembership(seccionId, auth.getName())
                    .orElseThrow(() -> new Exception("No tienes acceso"));

            if (adminMembership.getRol() != Rol.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("message", "Solo los admins pueden cambiar roles"));
            }

            SeccionUsuario target = seccionUsuarioRepo.findById(colabId)
                    .orElseThrow(() -> new Exception("Colaborador no encontrado"));

            target.setRol(Rol.valueOf(payload.get("rol")));
            seccionUsuarioRepo.save(target);

            return ResponseEntity.ok(Map.of("message", "Rol actualizado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/secciones/unirse")
    public ResponseEntity<?> unirseConCodigo(@RequestBody Map<String, String> payload) {
        try {
            String codigo = payload.get("codigo");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            seccionService.unirseConCodigo(codigo, auth.getName());
            return ResponseEntity.ok(Map.of("message", "¡Te has unido a la sección con éxito!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
}