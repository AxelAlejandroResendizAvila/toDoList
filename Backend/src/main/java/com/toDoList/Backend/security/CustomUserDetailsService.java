package com.toDoList.Backend.security;

import com.toDoList.Backend.model.User;
import com.toDoList.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        User user = userRepository.findByCorreo(correo);

        if (user == null) {
            throw new UsernameNotFoundException("Usuario no encontrado con correo: " + correo);
        }

        // Spring Security requiere el correo como "username" y la contraseña
        return new org.springframework.security.core.userdetails.User(
                user.getCorreo(),
                user.getPassword(),
                new ArrayList<>() // Lista de authorities (Roles), por ahora vacía
        );
    }
}
