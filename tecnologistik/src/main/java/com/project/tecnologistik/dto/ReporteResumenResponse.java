package com.project.tecnologistik.dto;

public class ReporteResumenResponse {

    private Long total;
    private Long abiertos;
    private Long asignados;
    private Long enProceso;
    private Long resueltos;
    private Long cerrados;

    public ReporteResumenResponse() {
    }

    public ReporteResumenResponse(
            Long total,
            Long abiertos,
            Long asignados,
            Long enProceso,
            Long resueltos,
            Long cerrados
    ) {
        this.total = total;
        this.abiertos = abiertos;
        this.asignados = asignados;
        this.enProceso = enProceso;
        this.resueltos = resueltos;
        this.cerrados = cerrados;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
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