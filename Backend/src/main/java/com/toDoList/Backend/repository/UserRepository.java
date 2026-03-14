package com.toDoList.Backend.repository;

import com.toDoList.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // BúSQUEDAS PERSONALIZADAS
    
    /**
     * Encuentra un usuario por su correo electrónico
     * SQL generado automáticamente: SELECT * FROM users WHERE correo = ?
     */
    User findByCorreo(String correo);
    
    /**
     * Busca un usuario por correo y contraseña (usado en login)
     * SQL: SELECT * FROM users WHERE correo = ? AND password = ?
     */
    User findByCorreoAndPassword(String correo, String password);
}