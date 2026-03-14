package com.toDoList.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tarea_colaboradores")
@Data
@NoArgsConstructor
public class TareaColaborador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tarea_id", nullable = false)
    @JsonIgnore
    private Tarea tarea;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    private String estatusStr = "PENDIENTE"; // PENDIENTE, EN_PROCESO, COMPLETADA
}
