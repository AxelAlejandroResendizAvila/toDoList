package com.toDoList.Backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    public void enviarInvitacion(String to, String seccionNombre, String token) {
        // En un caso real, aquí usarías JavaMailSender
        System.out.println("=================================================");
        System.out.println("ENVIANDO CORREO A: " + to);
        System.out.println("Has sido invitado a colaborar en la sección: " + seccionNombre);
        System.out.println("Acepta la invitación usando este token: " + token);
        System.out.println("URL Sugerida: http://localhost:5173/invitacion?token=" + token);
        System.out.println("=================================================");
        
        // TIP: Para habilitar correos reales, añade 'spring-boot-starter-mail' al pom.xml
        // y configura las propiedades de 'spring.mail.*' en application.properties
    }
}
