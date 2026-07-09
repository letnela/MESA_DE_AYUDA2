package com.project.tecnologistik.service;

import com.project.tecnologistik.model.HistorialTicket;
import com.project.tecnologistik.model.Ticket;
import com.project.tecnologistik.model.Usuario;
import com.project.tecnologistik.repository.CategoriaRepository;
import com.project.tecnologistik.repository.HistorialTicketRepository;
import com.project.tecnologistik.repository.TicketRepository;
import com.project.tecnologistik.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private HistorialTicketRepository historialTicketRepository;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void cambiarEstadoGuardaObservacionCuandoSeResuelve() {
        UUID ticketId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();

        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        ticket.setEstado("ASIGNADO");

        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setNombreCompleto("Carlos Ramírez");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(historialTicketRepository.save(any(HistorialTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket actualizado = ticketService.cambiarEstado(ticketId, "RESUELTO", usuarioId, "Se reinstaló el servicio y se validó el acceso.");

        assertEquals("RESUELTO", actualizado.getEstado());
        assertEquals("Se reinstaló el servicio y se validó el acceso.", actualizado.getObservacionResolucion());
        verify(historialTicketRepository).save(any(HistorialTicket.class));
    }
}
