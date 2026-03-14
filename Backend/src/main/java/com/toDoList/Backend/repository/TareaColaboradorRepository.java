package com.toDoList.Backend.repository;

import com.toDoList.Backend.model.TareaColaborador;
import com.toDoList.Backend.model.Tarea;
import com.toDoList.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TareaColaboradorRepository extends JpaRepository<TareaColaborador, Long> {
    Optional<TareaColaborador> findByTareaAndUsuario(Tarea tarea, User usuario);
}
