package com.project.tecnologistik.repository;

import com.project.tecnologistik.model.HistorialTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HistorialTicketRepository extends JpaRepository<HistorialTicket, UUID> {

    List<HistorialTicket> findByTicketIdOrderByFechaDesc(UUID ticketId);

}