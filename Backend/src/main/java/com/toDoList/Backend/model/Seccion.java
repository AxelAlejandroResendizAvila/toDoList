package com.toDoList.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.time.Instant;
import java.time.Duration;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "secciones")
@Data
public class Seccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Instant fechaCreacion = Instant.now();
    private Integer tiempoAsignadoMinutos;

    @Column(unique = true)
    private String codigoInvitacion = UUID.randomUUID().toString();

    private Instant codigoExpiracion;

    @OneToMany(mappedBy = "seccion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SeccionUsuario> colaboradores = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User usuario;

    @OneToMany(mappedBy = "seccion", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<Tarea> tareas;

    @Transient
    public long getTiempoRestante() {
        if (tiempoAsignadoMinutos == null)
            return 0;

        long trascurrido = Duration.between(fechaCreacion, Instant.now()).toMinutes();
        long restante = tiempoAsignadoMinutos - trascurrido;

        return Math.max(0, restante);
    }

}