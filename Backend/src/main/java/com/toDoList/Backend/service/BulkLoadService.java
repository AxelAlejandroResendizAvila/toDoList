package com.toDoList.Backend.service;

import com.toDoList.Backend.dto.BulkLoadDTO;
import com.toDoList.Backend.model.*;
import com.toDoList.Backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class BulkLoadService {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private SeccionRepository seccionRepo;
    @Autowired
    private SeccionUsuarioRepository seccionUsuarioRepo;
    @Autowired
    private TareaRepository tareaRepo;
    @Autowired
    private TareaColaboradorRepository tareaColaboradorRepo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public String processBulkLoad(BulkLoadDTO bulkData) {
        int usersCreated = 0;
        int sectionsCreated = 0;
        int tasksCreated = 0;
        int assignmentsCreated = 0;

        // 1. Pre-cargar/crear todos los usuarios para asegurar que existan para las asignaciones
        for (BulkLoadDTO.UserBulkDTO userDto : bulkData.getUsers()) {
            User user = userRepo.findByCorreo(userDto.getCorreo());
            if (user == null) {
                user = new User();
                user.setNombre(userDto.getNombre());
                user.setCorreo(userDto.getCorreo());
                user.setTelefono(userDto.getTelefono());
                user.setPassword(passwordEncoder.encode("123456"));
                userRepo.save(user);
                usersCreated++;
            }
        }

        // 2. Procesar secciones y tareas
        for (BulkLoadDTO.UserBulkDTO userDto : bulkData.getUsers()) {
            User user = userRepo.findByCorreo(userDto.getCorreo());

            if (userDto.getSecciones() != null) {
                for (BulkLoadDTO.SeccionBulkDTO seccionDto : userDto.getSecciones()) {
                    Seccion seccion = new Seccion();
                    seccion.setNombre(seccionDto.getNombre());
                    seccion.setTiempoAsignadoMinutos(seccionDto.getTiempoAsignadoMinutos());
                    seccion.setUsuario(user); // Creador
                    seccion = seccionRepo.save(seccion);
                    sectionsCreated++;

                    // Registrar como ADMIN de la sección
                    SeccionUsuario membership = new SeccionUsuario();
                    membership.setSeccion(seccion);
                    membership.setUsuario(user);
                    membership.setRol(Rol.ADMIN);
                    seccionUsuarioRepo.save(membership);

                    if (seccionDto.getTareas() != null) {
                        for (BulkLoadDTO.TareaBulkDTO tareaDto : seccionDto.getTareas()) {
                            Tarea tarea = new Tarea();
                            tarea.setNombre(tareaDto.getNombre());
                            tarea.setDescripcion(tareaDto.getDescripcion());
                            tarea.setPrioridad(tareaDto.getPrioridad());
                            tarea.setEstatus(tareaDto.getEstatus());
                            tarea.setFechaLimite(tareaDto.getFechaLimite());
                            tarea.setSeccion(seccion);
                            tarea = tareaRepo.save(tarea);
                            tasksCreated++;

                            // 3. Procesar asignaciones de la tarea
                            if (tareaDto.getCorreosAsignados() != null) {
                                for (String correo : tareaDto.getCorreosAsignados()) {
                                    User colaborador = userRepo.findByCorreo(correo);
                                    if (colaborador != null) {
                                        // Verificar si ya está en la sección, si no, añadirlo como COLABORADOR
                                        if (seccionUsuarioRepo.findBySeccionAndUsuario(seccion, colaborador).isEmpty()) {
                                            SeccionUsuario su = new SeccionUsuario();
                                            su.setSeccion(seccion);
                                            su.setUsuario(colaborador);
                                            su.setRol(Rol.EDITOR);
                                            seccionUsuarioRepo.save(su);
                                        }

                                        TareaColaborador tc = new TareaColaborador();
                                        tc.setTarea(tarea);
                                        tc.setUsuario(colaborador);
                                        tc.setEstatusStr("PENDIENTE");
                                        tareaColaboradorRepo.save(tc);
                                        assignmentsCreated++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return String.format("Carga masiva completada: %d usuarios, %d secciones, %d tareas y %d asignaciones.", 
                usersCreated, sectionsCreated, tasksCreated, assignmentsCreated);
    }
}
