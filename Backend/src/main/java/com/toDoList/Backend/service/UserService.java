package com.toDoList.Backend.service;

import com.toDoList.Backend.model.User;
import com.toDoList.Backend.dto.UserDTO;
import com.toDoList.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepo.findById(id).map(this::convertToDTO);
    }

    public Optional<User> findFullUserById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<UserDTO> getUserByEmail(String email) {
        return Optional.ofNullable(userRepo.findByCorreo(email)).map(this::convertToDTO);
    }

    public User registerUser(User user) throws Exception {
        if (userRepo.findByCorreo(user.getCorreo()) != null) {
            throw new Exception("El email ya está registrado");
        }
        String hashedPassword = new BCryptPasswordEncoder().encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepo.save(user);
    }

    public UserDTO updateUser(Long id, User userDetails) throws Exception {
        return userRepo.findById(id).map(user -> {
            if (userDetails.getNombre() != null)
                user.setNombre(userDetails.getNombre());
            if (userDetails.getCorreo() != null)
                user.setCorreo(userDetails.getCorreo());
            if (userDetails.getTelefono() != null)
                user.setTelefono(userDetails.getTelefono());
            return convertToDTO(userRepo.save(user));
        }).orElseThrow(() -> new Exception("Usuario no encontrado"));
    }

    public void deleteUser(Long id) throws Exception {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
        } else {
            throw new Exception("Usuario no encontrado");
        }
    }

    // Método utilitario para convertir Entidad a DTO
    public UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getNombre(),
                user.getCorreo(),
                user.getTelefono());
    }
}
