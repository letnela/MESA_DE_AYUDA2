package com.project.tecnologistik.service;

import com.project.tecnologistik.dto.DashboardResponse;
import com.project.tecnologistik.repository.TicketRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;

    public DashboardService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public DashboardResponse obtenerDashboard() {

        DashboardResponse response = new DashboardResponse();

        response.setTotalTickets(ticketRepository.count());

        response.setAbiertos(
                ticketRepository.countByEstado("ABIERTO")
        );

        response.setAsignados(
                ticketRepository.countByEstado("ASIGNADO")
        );

        response.setEnProceso(
                ticketRepository.countByEstado("EN_PROCESO")
        );

        response.setResueltos(
                ticketRepository.countByEstado("RESUELTO")
        );

        response.setCerrados(
                ticketRepository.countByEstado("CERRADO")
        );

        return response;
    }
}