package com.toDoList.Backend.repository;

import com.toDoList.Backend.model.SeccionUsuario;
import com.toDoList.Backend.model.Seccion;
import com.toDoList.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeccionUsuarioRepository extends JpaRepository<SeccionUsuario, Long> {
    List<SeccionUsuario> findByUsuario(User usuario);
    List<SeccionUsuario> findBySeccion(Seccion seccion);
    Optional<SeccionUsuario> findBySeccionAndUsuario(Seccion seccion, User usuario);
}
