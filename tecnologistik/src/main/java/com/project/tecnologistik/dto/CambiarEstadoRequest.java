package com.project.tecnologistik.dto;

import java.util.UUID;

public class CambiarEstadoRequest {

    private UUID ticketId;
    private String nuevoEstado;
    private UUID usuarioAccionId;
    private String observacionResolucion;

    public UUID getTicketId() {
        return ticketId;
    }

    public void setTicketId(UUID ticketId) {
        this.ticketId = ticketId;
    }

    public String getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(String nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public UUID getUsuarioAccionId() {
        return usuarioAccionId;
    }

    public void setUsuarioAccionId(UUID usuarioAccionId) {
        this.usuarioAccionId = usuarioAccionId;
    }

    public String getObservacionResolucion() {
        return observacionResolucion;
    }

    public void setObservacionResolucion(String observacionResolucion) {
        this.observacionResolucion = observacionResolucion;
    }
}