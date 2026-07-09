package com.project.tecnologistik.repository;

import com.project.tecnologistik.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    long countByEstado(String estado);

    @Query("""
        SELECT t
        FROM Ticket t
        WHERE t.usuario.id = :usuarioId
        ORDER BY t.fechaCreacion DESC
    """)
    List<Ticket> findTicketsByUsuarioId(@Param("usuarioId") UUID usuarioId);

    @Query("""
        SELECT t
        FROM Ticket t
        WHERE t.tecnico.id = :tecnicoId
        ORDER BY t.fechaCreacion DESC
    """)
    List<Ticket> findTicketsByTecnicoId(@Param("tecnicoId") UUID tecnicoId);

    @Query("""
        SELECT t.categoria.nombre, COUNT(t)
        FROM Ticket t
        GROUP BY t.categoria.nombre
    """)
    List<Object[]> ticketsPorCategoria();

    @Query("""
        SELECT t.estado, COUNT(t)
        FROM Ticket t
        GROUP BY t.estado
    """)
    List<Object[]> ticketsPorEstado();

    @Query("""
        SELECT t.prioridad, COUNT(t)
        FROM Ticket t
        GROUP BY t.prioridad
    """)
    List<Object[]> ticketsPorPrioridad();
}