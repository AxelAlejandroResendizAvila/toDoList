package com.toDoList.Backend.controller;

import com.toDoList.Backend.dto.AuthRequestDTO;
import com.toDoList.Backend.model.User;
import com.toDoList.Backend.repository.UserRepository;
import com.toDoList.Backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;



    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
        User user = userRepository.findByCorreo(authRequest.getCorreo());

        if (user != null && new BCryptPasswordEncoder().matches(authRequest.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getCorreo());
            return ResponseEntity.ok(java.util.Collections.singletonMap("token", token));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }
    }
}
