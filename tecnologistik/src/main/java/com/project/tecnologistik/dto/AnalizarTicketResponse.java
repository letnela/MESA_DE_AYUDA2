package com.project.tecnologistik.dto;

public class AnalizarTicketResponse {
    private String tipoSolicitud;
    private String areaDestino;
    private String prioridad;
    private String respuestaSugerida;

    public AnalizarTicketResponse() {}

    public AnalizarTicketResponse(String tipoSolicitud, String areaDestino, String prioridad, String respuestaSugerida) {
        this.tipoSolicitud = tipoSolicitud;
        this.areaDestino = areaDestino;
        this.prioridad = prioridad;
        this.respuestaSugerida = respuestaSugerida;
    }

    public String getTipoSolicitud() { return tipoSolicitud; }
    public void setTipoSolicitud(String tipoSolicitud) { this.tipoSolicitud = tipoSolicitud; }

    public String getAreaDestino() { return areaDestino; }
    public void setAreaDestino(String areaDestino) { this.areaDestino = areaDestino; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getRespuestaSugerida() { return respuestaSugerida; }
    public void setRespuestaSugerida(String respuestaSugerida) { this.respuestaSugerida = respuestaSugerida; }
}