package com.project.tecnologistik.service;

import com.project.tecnologistik.dto.AnalizarTicketRequest;
import com.project.tecnologistik.dto.AnalizarTicketResponse;
import com.project.tecnologistik.dto.ClienteTicketRequest;
import com.project.tecnologistik.dto.TicketRequest;
import com.project.tecnologistik.model.Categoria;
import com.project.tecnologistik.model.HistorialTicket;
import com.project.tecnologistik.model.Ticket;
import com.project.tecnologistik.model.TicketAdjunto;
import com.project.tecnologistik.model.Usuario;
import com.project.tecnologistik.repository.CategoriaRepository;
import com.project.tecnologistik.repository.HistorialTicketRepository;
import com.project.tecnologistik.repository.TicketRepository;
import com.project.tecnologistik.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialTicketRepository historialTicketRepository;
    private final GeminiIaService geminiIaService;

    public TicketService(
            TicketRepository ticketRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository,
            HistorialTicketRepository historialTicketRepository,
            GeminiIaService geminiIaService
    ) {
        this.ticketRepository = ticketRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.historialTicketRepository = historialTicketRepository;
        this.geminiIaService = geminiIaService;
    }

    public Ticket crearTicket(TicketRequest request, UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Ticket ticket = new Ticket();

        ticket.setCodigo("TK-" + System.currentTimeMillis());
        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setPrioridad(request.getPrioridad());
        ticket.setFechaLimite(request.getFechaLimite());
        ticket.setTiempoEstimadoHoras(request.getTiempoEstimadoHoras());
        ticket.setEstado("ABIERTO");
        ticket.setFechaCreacion(LocalDateTime.now());
        ticket.setUsuario(usuario);
        ticket.setCategoria(categoria);

        ticket.setTipoSolicitud("INCIDENCIA");
        ticket.setAreaDestino("TECNICO");
        ticket.setRespuestaIa(null);
        ticket.setAnalizadoPorIa(false);

        Ticket ticketGuardado = ticketRepository.save(ticket);

        guardarHistorial(
                ticketGuardado,
                usuario,
                "CREACION",
                "Ticket creado correctamente"
        );

        return ticketGuardado;
    }

    public Ticket crearTicketCliente(
            ClienteTicketRequest request,
            List<MultipartFile> archivos,
            UUID usuarioId
    ) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        AnalizarTicketRequest iaRequest = new AnalizarTicketRequest();
        iaRequest.setTitulo(request.getTitulo());
        iaRequest.setDescripcion(request.getDescripcion());

        AnalizarTicketResponse analisis = geminiIaService.analizarTicket(iaRequest);

        Ticket ticket = new Ticket();

        ticket.setCodigo("TK-" + System.currentTimeMillis());
        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setEstado("ABIERTO");
        ticket.setFechaCreacion(LocalDateTime.now());
        ticket.setUsuario(usuario);

        ticket.setPrioridad(
                analisis.getPrioridad() != null ? analisis.getPrioridad() : "MEDIA"
        );

        ticket.setTipoSolicitud(
                analisis.getTipoSolicitud() != null ? analisis.getTipoSolicitud() : "INCIDENCIA"
        );

        ticket.setAreaDestino(
                analisis.getAreaDestino() != null ? analisis.getAreaDestino() : "TECNICO"
        );

        ticket.setRespuestaIa(analisis.getRespuestaSugerida());
        ticket.setAnalizadoPorIa(true);

        ticket.setFechaLimite(null);
        ticket.setTiempoEstimadoHoras(1);
        ticket.setCategoria(null);
        ticket.setTecnico(null);

        Ticket ticketGuardado = ticketRepository.save(ticket);

        guardarArchivos(archivos, ticketGuardado);

        guardarHistorial(
                ticketGuardado,
                usuario,
                "CREACION_CLIENTE_IA",
                "Ticket creado por cliente y analizado por IA. Área destino: "
                        + ticketGuardado.getAreaDestino()
        );

        return ticketGuardado;
    }

    public List<Ticket> listarTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> listarTicketsPorUsuario(UUID usuarioId) {
        return ticketRepository.findTicketsByUsuarioId(usuarioId);
    }

    public List<Ticket> listarTicketsPorTecnico(UUID tecnicoId) {
        return ticketRepository.findTicketsByTecnicoId(tecnicoId);
    }

    public Ticket obtenerTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    }

    public Ticket editarTicket(UUID id, TicketRequest request, UUID usuarioAccionId) {

        Ticket ticket = obtenerTicket(id);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setPrioridad(request.getPrioridad());
        ticket.setCategoria(categoria);
        ticket.setFechaLimite(request.getFechaLimite());
        ticket.setTiempoEstimadoHoras(request.getTiempoEstimadoHoras());

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "EDICION",
                "Ticket editado correctamente"
        );

        return actualizado;
    }

    public void eliminarTicket(UUID id, UUID usuarioAccionId) {

        Ticket ticket = obtenerTicket(id);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        guardarHistorial(
                ticket,
                usuarioAccion,
                "ELIMINACION",
                "Ticket eliminado del sistema"
        );

        ticketRepository.delete(ticket);
    }

    public Ticket asignarTecnico(
            UUID ticketId,
            UUID tecnicoId,
            UUID usuarioAccionId
    ) {

        Ticket ticket = obtenerTicket(ticketId);

        Usuario tecnico = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        ticket.setTecnico(tecnico);
        ticket.setEstado("ASIGNADO");

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "ASIGNACION",
                "Ticket asignado al técnico: " + tecnico.getNombreCompleto()
        );

        return actualizado;
    }

    public Ticket cambiarEstado(
            UUID ticketId,
            String nuevoEstado,
            UUID usuarioAccionId
    ) {
        return cambiarEstado(ticketId, nuevoEstado, usuarioAccionId, null);
    }

    public Ticket cambiarEstado(
            UUID ticketId,
            String nuevoEstado,
            UUID usuarioAccionId,
            String observacionResolucion
    ) {

        Ticket ticket = obtenerTicket(ticketId);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        String estadoAnterior = ticket.getEstado();

        ticket.setEstado(nuevoEstado);

        if (observacionResolucion != null && !observacionResolucion.isBlank()) {
            ticket.setObservacionResolucion(observacionResolucion.trim());
        } else if ("RESUELTO".equals(nuevoEstado) || "CERRADO".equals(nuevoEstado)) {
            ticket.setObservacionResolucion("Ticket marcado como " + nuevoEstado);
        }

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "CAMBIO_ESTADO",
                "Estado cambiado de " + estadoAnterior + " a " + nuevoEstado
        );

        return actualizado;
    }

    public List<HistorialTicket> obtenerHistorial(UUID ticketId) {
        return historialTicketRepository.findByTicketIdOrderByFechaDesc(ticketId);
    }

    private void guardarArchivos(List<MultipartFile> archivos, Ticket ticket) {

        if (archivos == null || archivos.isEmpty()) {
            return;
        }

        for (MultipartFile archivo : archivos) {

            if (archivo.isEmpty()) {
                continue;
            }

            try {
                String nombreOriginal = archivo.getOriginalFilename();
                String extension = "";

                if (nombreOriginal != null && nombreOriginal.contains(".")) {
                    extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                }

                String nombreArchivo = UUID.randomUUID() + extension;

                Path carpeta = Paths.get("uploads/tickets");
                Files.createDirectories(carpeta);

                Path rutaArchivo = carpeta.resolve(nombreArchivo);

                Files.copy(
                        archivo.getInputStream(),
                        rutaArchivo,
                        StandardCopyOption.REPLACE_EXISTING
                );

                TicketAdjunto adjunto = new TicketAdjunto();
                adjunto.setTicket(ticket);
                adjunto.setNombreArchivo(nombreArchivo);
                adjunto.setNombreOriginal(nombreOriginal);
                adjunto.setTipoArchivo(archivo.getContentType());
                adjunto.setTamanio(archivo.getSize());
                adjunto.setRuta(rutaArchivo.toString());

                ticket.getAdjuntos().add(adjunto);

            } catch (Exception e) {
                throw new RuntimeException("Error al guardar archivo adjunto", e);
            }
        }

        ticketRepository.save(ticket);
    }

    private void guardarHistorial(
            Ticket ticket,
            Usuario usuario,
            String accion,
            String comentario
    ) {

        HistorialTicket historial = new HistorialTicket();

        historial.setTicket(ticket);
        historial.setUsuario(usuario);
        historial.setAccion(accion);
        historial.setComentario(comentario);
        historial.setFecha(LocalDateTime.now());

        historialTicketRepository.save(historial);
    }
}