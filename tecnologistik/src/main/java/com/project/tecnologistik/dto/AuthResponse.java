package com.project.tecnologistik.dto;

import java.util.UUID;

public class AuthResponse {

    private String token;
    private String tipo;
    private String rol;

    private UUID usuarioId;
    private String email;
    private String nombreCompleto;

    public AuthResponse() {
    }

    public AuthResponse(
            String token,
            String tipo,
            String rol,
            UUID usuarioId,
            String email,
            String nombreCompleto
    ) {
        this.token = token;
        this.tipo = tipo;
        this.rol = rol;
        this.usuarioId = usuarioId;
        this.email = email;
        this.nombreCompleto = nombreCompleto;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }
}