package com.toDoList.Backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class UserProfileDTO {
    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private List<Map<String, Object>> seccionesEnComun;
}
