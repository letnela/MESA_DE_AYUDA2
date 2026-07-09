package com.project.tecnologistik.controller;

import com.project.tecnologistik.dto.AsignarTicketRequest;
import com.project.tecnologistik.dto.CambiarEstadoRequest;
import com.project.tecnologistik.dto.ClienteTicketRequest;
import com.project.tecnologistik.dto.TicketRequest;
import com.project.tecnologistik.model.HistorialTicket;
import com.project.tecnologistik.model.Ticket;
import com.project.tecnologistik.service.TicketService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> crearTicket(
            @RequestBody TicketRequest request,
            @RequestParam UUID usuarioId
    ) {
        return ResponseEntity.ok(
                ticketService.crearTicket(request, usuarioId)
        );
    }

    @PostMapping(
            value = "/cliente",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Ticket> crearTicketCliente(
            @RequestPart("ticket") ClienteTicketRequest request,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos,
            @RequestParam UUID usuarioId
    ) {
        return ResponseEntity.ok(
                ticketService.crearTicketCliente(request, archivos, usuarioId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> listarTickets() {
        return ResponseEntity.ok(ticketService.listarTickets());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Ticket>> listarTicketsPorUsuario(
            @PathVariable UUID usuarioId
    ) {
        return ResponseEntity.ok(ticketService.listarTicketsPorUsuario(usuarioId));
    }

    @GetMapping("/tecnico/{tecnicoId}")
    public ResponseEntity<List<Ticket>> listarTicketsPorTecnico(
            @PathVariable UUID tecnicoId
    ) {
        return ResponseEntity.ok(ticketService.listarTicketsPorTecnico(tecnicoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> obtenerTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.obtenerTicket(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> editarTicket(
            @PathVariable UUID id,
            @RequestBody TicketRequest request,
            @RequestParam UUID usuarioAccionId
    ) {
        return ResponseEntity.ok(
                ticketService.editarTicket(id, request, usuarioAccionId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTicket(
            @PathVariable UUID id,
            @RequestParam UUID usuarioAccionId
    ) {
        ticketService.eliminarTicket(id, usuarioAccionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialTicket>> obtenerHistorial(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ticketService.obtenerHistorial(id));
    }

    @PutMapping("/asignar")
    public ResponseEntity<Ticket> asignarTecnico(
            @RequestBody AsignarTicketRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.asignarTecnico(
                        request.getTicketId(),
                        request.getTecnicoId(),
                        request.getUsuarioAccionId()
                )
        );
    }

    @PutMapping("/estado")
    public ResponseEntity<Ticket> cambiarEstado(
            @RequestBody CambiarEstadoRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.cambiarEstado(
                        request.getTicketId(),
                        request.getNuevoEstado(),
                        request.getUsuarioAccionId(),
                        request.getObservacionResolucion()
                )
        );
    }
}