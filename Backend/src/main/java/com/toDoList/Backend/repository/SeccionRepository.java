package com.toDoList.Backend.repository;

import com.toDoList.Backend.model.Seccion;
import com.toDoList.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeccionRepository extends JpaRepository<Seccion, Long> {
    List<Seccion> findByUsuario(User usuario);
    Optional<Seccion> findByCodigoInvitacion(String codigoInvitacion);
}