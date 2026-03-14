package com.toDoList.Backend.dto;

import lombok.Data;

@Data
public class AuthRequestDTO {
    private String correo;
    private String password;
}
