package com.project.tecnologistik.dto;

import java.util.UUID;

public class AsignarTicketRequest {

    private UUID ticketId;
    private UUID tecnicoId;
    private UUID usuarioAccionId;

    public UUID getTicketId() {
        return ticketId;
    }

    public void setTicketId(UUID ticketId) {
        this.ticketId = ticketId;
    }

    public UUID getTecnicoId() {
        return tecnicoId;
    }

    public void setTecnicoId(UUID tecnicoId) {
        this.tecnicoId = tecnicoId;
    }

    public UUID getUsuarioAccionId() {
        return usuarioAccionId;
    }

    public void setUsuarioAccionId(UUID usuarioAccionId) {
        this.usuarioAccionId = usuarioAccionId;
    }
}