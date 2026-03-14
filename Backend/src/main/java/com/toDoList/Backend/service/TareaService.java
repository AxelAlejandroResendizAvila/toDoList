package com.toDoList.Backend.service;

import com.toDoList.Backend.model.*;
import com.toDoList.Backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    @Autowired
    private TareaRepository tareaRepo;
    @Autowired
    private TareaColaboradorRepository asignacionRepo;
    @Autowired
    private UserRepository userRepo;

    public List<Tarea> getAllTareas() {
        return tareaRepo.findAll();
    }

    public Optional<Tarea> getTareaById(Long id) {
        return tareaRepo.findById(id);
    }
    
    public List<Tarea> getTareasBySeccionId(Long seccionId) {
        return tareaRepo.findBySeccionId(seccionId);
    }

    @Transactional
    public Tarea createTarea(Tarea tarea) throws Exception {
        if (tarea.getSeccion() == null || tarea.getSeccion().getId() == null) {
            throw new Exception("La tarea debe pertenecer a una sección");
        }
        
        // Copiar los correos para procesarlos después del save inicial
        java.util.List<String> emails = tarea.getCorreosAsignados();
        Tarea saved = tareaRepo.save(tarea);
        
        if (emails != null && !emails.isEmpty()) {
            for (String email : emails) {
                this.asignarUsuarioATarea(saved.getId(), email);
            }
        }
        
        return tareaRepo.findById(saved.getId()).get();
    }

    public Tarea updateTarea(Long id, Tarea tareaDetails) throws Exception {
        return tareaRepo.findById(id).map(tarea -> {
            if (tareaDetails.getNombre() != null)
                tarea.setNombre(tareaDetails.getNombre());
            if (tareaDetails.getDescripcion() != null)
                tarea.setDescripcion(tareaDetails.getDescripcion());
            if (tareaDetails.getFechaLimite() != null)
                tarea.setFechaLimite(tareaDetails.getFechaLimite());
            if (tareaDetails.getEstatus() != null)
                tarea.setEstatus(tareaDetails.getEstatus());
            if (tareaDetails.getPrioridad() != null)
                tarea.setPrioridad(tareaDetails.getPrioridad());
            return tareaRepo.save(tarea);
        }).orElseThrow(() -> new Exception("Tarea no encontrada"));
    }

    public void deleteTarea(Long id) throws Exception {
        if (tareaRepo.existsById(id)) {
            tareaRepo.deleteById(id);
        } else {
            throw new Exception("Tarea no encontrada");
        }
    }
    @Transactional
    public Tarea asignarUsuarioATarea(Long tareaId, String correo) throws Exception {
        Tarea tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new Exception("Tarea no encontrada"));
        User user = userRepo.findByCorreo(correo);
        if (user == null) throw new Exception("Usuario no encontrado");

        if (asignacionRepo.findByTareaAndUsuario(tarea, user).isPresent()) {
            throw new Exception("El usuario ya está asignado a esta tarea");
        }

        TareaColaborador asignacion = new TareaColaborador();
        asignacion.setTarea(tarea);
        asignacion.setUsuario(user);
        asignacion.setEstatusStr("PENDIENTE");
        asignacionRepo.save(asignacion);

        return actualizarEstatusGlobal(tarea);
    }

    @Transactional
    public Tarea desasignarUsuarioDeTarea(Long tareaId, String correo) throws Exception {
        Tarea tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new Exception("Tarea no encontrada"));
        User user = userRepo.findByCorreo(correo);
        if (user == null) throw new Exception("Usuario no encontrado");

        TareaColaborador asignacion = asignacionRepo.findByTareaAndUsuario(tarea, user)
                .orElseThrow(() -> new Exception("El usuario no está asignado a esta tarea"));

        asignacionRepo.delete(asignacion);
        tarea.getAsignaciones().remove(asignacion);

        return actualizarEstatusGlobal(tarea);
    }

    @Transactional
    public Tarea actualizarEstatusColaborador(Long tareaId, String correo, String nuevoEstatus) throws Exception {
        Tarea tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new Exception("Tarea no encontrada"));
        User user = userRepo.findByCorreo(correo);
        if (user == null) throw new Exception("Usuario no encontrado");

        TareaColaborador asignacion = asignacionRepo.findByTareaAndUsuario(tarea, user)
                .orElseThrow(() -> new Exception("El usuario no está asignado a esta tarea"));

        asignacion.setEstatusStr(nuevoEstatus);
        asignacionRepo.save(asignacion);

        return actualizarEstatusGlobal(tarea);
    }

    private Tarea actualizarEstatusGlobal(Tarea tarea) {
        List<TareaColaborador> asignaciones = tarea.getAsignaciones();
        if (asignaciones.isEmpty()) {
            // Si no hay nadie asignado, el estatus es el que tenga o PENDIENTE
            return tareaRepo.save(tarea);
        }

        boolean todasCompletadas = true;
        boolean algunaEnProceso = false;
        boolean algunaCompletada = false;

        for (TareaColaborador asig : asignaciones) {
            if (!asig.getEstatusStr().equals("COMPLETADA")) {
                todasCompletadas = false;
            }
            if (asig.getEstatusStr().equals("EN_PROCESO")) {
                algunaEnProceso = true;
            }
            if (asig.getEstatusStr().equals("COMPLETADA")) {
                algunaCompletada = true;
            }
        }

        if (todasCompletadas) {
            tarea.setEstatus("COMPLETADA");
        } else if (algunaEnProceso || algunaCompletada) {
            tarea.setEstatus("EN_PROCESO");
        } else {
            tarea.setEstatus("PENDIENTE");
        }

        return tareaRepo.save(tarea);
    }

    public List<Tarea> getTareasByEstatus(String estatus) {
        return tareaRepo.findByEstatus(estatus);
    }

    public List<Tarea> getTareasByPrioridad(Integer prioridad) {
        return tareaRepo.findByPrioridad(prioridad);
    }

    @Transactional
    public Tarea asignarVariosATarea(Long tareaId, List<String> correos) throws Exception {
        Tarea tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new Exception("Tarea no encontrada"));

        // Eliminar asignaciones actuales que ya no están en la lista
        tarea.getAsignaciones().removeIf(asig -> !correos.contains(asig.getUsuario().getCorreo()));

        // Agregar nuevas asignaciones
        for (String correo : correos) {
            boolean yaAsignado = tarea.getAsignaciones().stream()
                    .anyMatch(asig -> asig.getUsuario().getCorreo().equals(correo));
            
            if (!yaAsignado) {
                User user = userRepo.findByCorreo(correo);
                if (user != null) {
                    TareaColaborador asig = new TareaColaborador();
                    asig.setTarea(tarea);
                    asig.setUsuario(user);
                    asig.setEstatusStr("PENDIENTE");
                    tarea.getAsignaciones().add(asig);
                }
            }
        }

        return actualizarEstatusGlobal(tarea);
    }
}
