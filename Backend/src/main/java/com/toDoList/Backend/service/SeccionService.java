package com.toDoList.Backend.service;

import com.toDoList.Backend.model.*;
import com.toDoList.Backend.repository.SeccionRepository;
import com.toDoList.Backend.repository.UserRepository;
import com.toDoList.Backend.repository.SeccionUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SeccionService {

    @Autowired
    private SeccionRepository seccionRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private SeccionUsuarioRepository seccionUsuarioRepo;

    public List<Seccion> getAllSecciones() {
        return seccionRepo.findAll();
    }

    public Optional<Seccion> getSeccionById(Long id) {
        return seccionRepo.findById(id);
    }

    // Obtener secciones donde el usuario es colaborador (incluye las que creó como ADMIN)
    public List<Seccion> getSeccionesByUsuarioEmail(String email) {
        User usuario = userRepo.findByCorreo(email);
        if (usuario == null) return List.of();
        
        List<SeccionUsuario> colaboraciones = seccionUsuarioRepo.findByUsuario(usuario);
        return colaboraciones.stream()
                .map(SeccionUsuario::getSeccion)
                .toList();
    }

    public List<Seccion> getSharedSecciones(String email1, String email2) {
        User u1 = userRepo.findByCorreo(email1);
        User u2 = userRepo.findByCorreo(email2);
        if (u1 == null || u2 == null) return List.of();

        List<Seccion> s1 = getSeccionesByUsuarioEmail(email1);
        List<Seccion> s2 = getSeccionesByUsuarioEmail(email2);

        return s1.stream()
                .filter(s -> s2.stream().anyMatch(os -> os.getId().equals(s.getId())))
                .toList();
    }

    @Transactional
    public Seccion createSeccion(Seccion seccion, String userEmail) throws Exception {
        User usuario = userRepo.findByCorreo(userEmail);
        if (usuario == null) {
            throw new Exception("Usuario no encontrado");
        }
        seccion.setUsuario(usuario);
        Seccion savedSeccion = seccionRepo.save(seccion);

        // Al crearla, el creador es automáticamente ADMIN en la tabla de colaboradores
        SeccionUsuario adminColab = new SeccionUsuario();
        adminColab.setSeccion(savedSeccion);
        adminColab.setUsuario(usuario);
        adminColab.setRol(Rol.ADMIN);
        seccionUsuarioRepo.save(adminColab);

        return savedSeccion;
    }

    public Seccion updateSeccion(Long id, Seccion seccionDetails) throws Exception {
        return seccionRepo.findById(id).map(seccion -> {
            if (seccionDetails.getNombre() != null)
                seccion.setNombre(seccionDetails.getNombre());
            if (seccionDetails.getDescripcion() != null)
                seccion.setDescripcion(seccionDetails.getDescripcion());
            if (seccionDetails.getTiempoAsignadoMinutos() != null)
                seccion.setTiempoAsignadoMinutos(seccionDetails.getTiempoAsignadoMinutos());
            // El rol aquí ya no se actualiza directamente en Seccion, sino vía invitación o admin
            return seccionRepo.save(seccion);
        }).orElseThrow(() -> new Exception("Sección no encontrada"));
    }

    public void deleteSeccion(Long id) throws Exception {
        if (seccionRepo.existsById(id)) {
            seccionRepo.deleteById(id);
        } else {
            throw new Exception("Sección no encontrada");
        }
    }

    public Optional<SeccionUsuario> getMembership(Long seccionId, String userEmail) {
        User usuario = userRepo.findByCorreo(userEmail);
        Optional<Seccion> seccion = seccionRepo.findById(seccionId);
        if (usuario != null && seccion.isPresent()) {
            return seccionUsuarioRepo.findBySeccionAndUsuario(seccion.get(), usuario);
        }
        return Optional.empty();
    }

    @Transactional
    public String getOrGenerateCodigoInvitacion(Long seccionId) throws Exception {
        Seccion seccion = seccionRepo.findById(seccionId)
                .orElseThrow(() -> new Exception("Sección no encontrada"));

        // Si no hay código O el código está expirado, generamos uno nuevo
        if (seccion.getCodigoInvitacion() == null || seccion.getCodigoInvitacion().isEmpty() ||
            (seccion.getCodigoExpiracion() != null && seccion.getCodigoExpiracion().isBefore(java.time.Instant.now()))) {

            seccion.setCodigoInvitacion(java.util.UUID.randomUUID().toString());
            // El código expira en 30 minutos por defecto cada vez que se genera/cambia
            seccion.setCodigoExpiracion(java.time.Instant.now().plus(java.time.Duration.ofMinutes(30)));
            seccionRepo.save(seccion);
        }

        return seccion.getCodigoInvitacion();
    }

    @Transactional
    public String regenerarCodigoInvitacion(Long seccionId) throws Exception {
        Seccion seccion = seccionRepo.findById(seccionId)
                .orElseThrow(() -> new Exception("Sección no encontrada"));

        seccion.setCodigoInvitacion(java.util.UUID.randomUUID().toString());
        seccion.setCodigoExpiracion(java.time.Instant.now().plus(java.time.Duration.ofMinutes(30)));
        seccionRepo.save(seccion);

        return seccion.getCodigoInvitacion();
    }

    @Transactional
    public void unirseConCodigo(String codigo, String userEmail) throws Exception {
        Seccion seccion = seccionRepo.findByCodigoInvitacion(codigo)
                .orElseThrow(() -> new Exception("Código de invitación inválido"));

        User user = userRepo.findByCorreo(userEmail);
        if (user == null) {
            throw new Exception("Debes registrarte antes de unirte");
        }

        // Verificar si ya es colaborador
        if (seccionUsuarioRepo.findBySeccionAndUsuario(seccion, user).isPresent()) {
            throw new Exception("Ya eres colaborador de esta sección");
        }

        // No puede unirse a su propia sección (ya es owner)
        if (seccion.getUsuario().getId().equals(user.getId())) {
            throw new Exception("Esta sección ya te pertenece");
        }

        // Verificar si el código ha expirado
        if (seccion.getCodigoExpiracion() != null && seccion.getCodigoExpiracion().isBefore(java.time.Instant.now())) {
            throw new Exception("El código de invitación ha expirado. Solicita uno nuevo al administrador.");
        }

        SeccionUsuario collab = new SeccionUsuario();
        collab.setSeccion(seccion);
        collab.setUsuario(user);
        collab.setRol(Rol.LECTOR);
        seccionUsuarioRepo.save(collab);
    }
}
