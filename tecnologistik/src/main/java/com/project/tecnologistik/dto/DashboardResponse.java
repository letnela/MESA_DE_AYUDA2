package com.project.tecnologistik.dto;

public class DashboardResponse {

    private Long totalTickets;
    private Long abiertos;
    private Long asignados;
    private Long enProceso;
    private Long resueltos;
    private Long cerrados;

    public Long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(Long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public Long getAbiertos() {
        return abiertos;
    }

    public void setAbiertos(Long abiertos) {
        this.abiertos = abiertos;
    }

    public Long getAsignados() {
        return asignados;
    }

    public void setAsignados(Long asignados) {
        this.asignados = asignados;
    }

    public Long getEnProceso() {
        return enProceso;
    }

    public void setEnProceso(Long enProceso) {
        this.enProceso = enProceso;
    }

    public Long getResueltos() {
        return resueltos;
    }

    public void setResueltos(Long resueltos) {
        this.resueltos = resueltos;
    }

    public Long getCerrados() {
        return cerrados;
    }

    public void setCerrados(Long cerrados) {
        this.cerrados = cerrados;
    }
}