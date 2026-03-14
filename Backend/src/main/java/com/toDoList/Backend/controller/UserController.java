package com.toDoList.Backend.controller;

import com.toDoList.Backend.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.toDoList.Backend.service.UserService;
import com.toDoList.Backend.service.SeccionService;
import com.toDoList.Backend.dto.UserDTO;
import com.toDoList.Backend.dto.UserProfileDTO;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private SeccionService seccionService;

    @GetMapping("/test-db")
    public String test() {
        return "Conexión a Neon activa. Tablas mapeadas: Users.";
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable("id") Long id) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            User targetUser = userService.findFullUserById(id)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));
            
            List<Seccion> shared = seccionService.getSharedSecciones(auth.getName(), targetUser.getCorreo());
            
            UserProfileDTO profile = new UserProfileDTO();
            profile.setId(targetUser.getId());
            profile.setNombre(targetUser.getNombre());
            profile.setCorreo(targetUser.getCorreo());
            profile.setTelefono(targetUser.getTelefono());
            
            profile.setSeccionesEnComun(shared.stream().map(s -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", s.getId());
                map.put("nombre", s.getNombre());
                return map;
            }).toList());
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    // ==================== USUARIOS ====================

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return userService.getUserByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(userService.convertToDTO(savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long id, @RequestBody User userDetails) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, userDetails));
        } catch (Exception e) {
            if (e.getMessage().equals("Usuario no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Usuario eliminado correctamente"));
        } catch (Exception e) {
            if (e.getMessage().equals("Usuario no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}