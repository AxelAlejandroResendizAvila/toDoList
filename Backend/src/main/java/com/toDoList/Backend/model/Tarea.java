package com.toDoList.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "tareas")
@Data
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Instant fechaLimite;
    private String estatus; // PENDIENTE, EN_PROCESO, COMPLETADA
    private Integer prioridad; // 1 (Alta), 2 (Media), 3 (Baja)

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private java.util.List<TareaColaborador> asignaciones = new java.util.ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "seccion_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private Seccion seccion;

    @Transient
    private java.util.List<String> correosAsignados;
}
