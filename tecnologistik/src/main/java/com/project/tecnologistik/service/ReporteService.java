package com.project.tecnologistik.service;

import com.project.tecnologistik.dto.ReporteItemResponse;
import com.project.tecnologistik.dto.ReporteResumenResponse;
import com.project.tecnologistik.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteService {

    private final TicketRepository ticketRepository;

    public ReporteService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public ReporteResumenResponse resumen() {
        return new ReporteResumenResponse(
                ticketRepository.count(),
                ticketRepository.countByEstado("ABIERTO"),
                ticketRepository.countByEstado("ASIGNADO"),
                ticketRepository.countByEstado("EN_PROCESO"),
                ticketRepository.countByEstado("RESUELTO"),
                ticketRepository.countByEstado("CERRADO")
        );
    }

    public List<ReporteItemResponse> porCategoria() {
        return ticketRepository.ticketsPorCategoria()
                .stream()
                .map(item -> new ReporteItemResponse(
                        String.valueOf(item[0]),
                        (Long) item[1]
                ))
                .toList();
    }

    public List<ReporteItemResponse> porEstado() {
        return ticketRepository.ticketsPorEstado()
                .stream()
                .map(item -> new ReporteItemResponse(
                        String.valueOf(item[0]),
                        (Long) item[1]
                ))
                .toList();
    }

    public List<ReporteItemResponse> porPrioridad() {
        return ticketRepository.ticketsPorPrioridad()
                .stream()
                .map(item -> new ReporteItemResponse(
                        String.valueOf(item[0]),
                        (Long) item[1]
                ))
                .toList();
    }
}