package com.project.tecnologistik.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(nullable = false, length = 20)
    private String prioridad;

    @Column(name = "tipo_solicitud", nullable = false, length = 30)
    private String tipoSolicitud;

    @Column(name = "area_destino", nullable = false, length = 30)
    private String areaDestino;

    @Column(name = "respuesta_ia", columnDefinition = "TEXT")
    private String respuestaIa;

    @Column(name = "analizado_por_ia", nullable = false)
    private Boolean analizadoPorIa = false;

    @Column(name = "recomendacion_aceptada")
    private Boolean recomendacionAceptada = false;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fechaUltimaActualizacion;

    private LocalDateTime fechaLimite;

    private Integer tiempoEstimadoHoras;

    @Column(columnDefinition = "TEXT")
    private String observacionResolucion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @OneToMany(
            mappedBy = "ticket",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    @JsonManagedReference
    private List<TicketAdjunto> adjuntos = new ArrayList<>();

    public Ticket() {
    }

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        fechaUltimaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        fechaUltimaActualizacion = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public String getTipoSolicitud() {
        return tipoSolicitud;
    }

    public void setTipoSolicitud(String tipoSolicitud) {
        this.tipoSolicitud = tipoSolicitud;
    }

    public String getAreaDestino() {
        return areaDestino;
    }

    public void setAreaDestino(String areaDestino) {
        this.areaDestino = areaDestino;
    }

    public String getRespuestaIa() {
        return respuestaIa;
    }

    public void setRespuestaIa(String respuestaIa) {
        this.respuestaIa = respuestaIa;
    }

    public Boolean getAnalizadoPorIa() {
        return analizadoPorIa;
    }

    public void setAnalizadoPorIa(Boolean analizadoPorIa) {
        this.analizadoPorIa = analizadoPorIa;
    }

    public Boolean getRecomendacionAceptada() {
        return recomendacionAceptada;
    }

    public void setRecomendacionAceptada(Boolean recomendacionAceptada) {
        this.recomendacionAceptada = recomendacionAceptada;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaUltimaActualizacion() {
        return fechaUltimaActualizacion;
    }

    public void setFechaUltimaActualizacion(LocalDateTime fechaUltimaActualizacion) {
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
    }

    public LocalDateTime getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDateTime fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public Integer getTiempoEstimadoHoras() {
        return tiempoEstimadoHoras;
    }

    public void setTiempoEstimadoHoras(Integer tiempoEstimadoHoras) {
        this.tiempoEstimadoHoras = tiempoEstimadoHoras;
    }

    public String getObservacionResolucion() {
        return observacionResolucion;
    }

    public void setObservacionResolucion(String observacionResolucion) {
        this.observacionResolucion = observacionResolucion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Usuario getTecnico() {
        return tecnico;
    }

    public void setTecnico(Usuario tecnico) {
        this.tecnico = tecnico;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public List<TicketAdjunto> getAdjuntos() {
        return adjuntos;
    }

    public void setAdjuntos(List<TicketAdjunto> adjuntos) {
        this.adjuntos = adjuntos;
    }
}