package com.toDoList.Backend.dto;

import java.util.List;

public class BulkLoadDTO {
    private List<UserBulkDTO> users;

    public List<UserBulkDTO> getUsers() { return users; }
    public void setUsers(List<UserBulkDTO> users) { this.users = users; }

    public static class UserBulkDTO {
        private String nombre;
        private String correo;
        private String telefono;
        private List<SeccionBulkDTO> secciones;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public List<SeccionBulkDTO> getSecciones() { return secciones; }
        public void setSecciones(List<SeccionBulkDTO> secciones) { this.secciones = secciones; }
    }

    public static class SeccionBulkDTO {
        private String nombre;
        private Integer tiempoAsignadoMinutos;
        private List<TareaBulkDTO> tareas;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Integer getTiempoAsignadoMinutos() { return tiempoAsignadoMinutos; }
        public void setTiempoAsignadoMinutos(Integer tiempoAsignadoMinutos) { this.tiempoAsignadoMinutos = tiempoAsignadoMinutos; }
        public List<TareaBulkDTO> getTareas() { return tareas; }
        public void setTareas(List<TareaBulkDTO> tareas) { this.tareas = tareas; }
    }

    public static class TareaBulkDTO {
        private String nombre;
        private String descripcion;
        private Integer prioridad;
        private String estatus;
        private java.time.Instant fechaLimite;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public Integer getPrioridad() { return prioridad; }
        public void setPrioridad(Integer prioridad) { this.prioridad = prioridad; }
        public String getEstatus() { return estatus; }
        public void setEstatus(String estatus) { this.estatus = estatus; }
        public java.time.Instant getFechaLimite() { return fechaLimite; }
        public void setFechaLimite(java.time.Instant fechaLimite) { this.fechaLimite = fechaLimite; }

        private List<String> correosAsignados;
        public List<String> getCorreosAsignados() { return correosAsignados; }
        public void setCorreosAsignados(List<String> correosAsignados) { this.correosAsignados = correosAsignados; }
    }
}
