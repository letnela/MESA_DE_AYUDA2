package com.project.tecnologistik.controller;

import com.project.tecnologistik.dto.ReporteItemResponse;
import com.project.tecnologistik.dto.ReporteResumenResponse;
import com.project.tecnologistik.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reportes")
@CrossOrigin("*")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<ReporteResumenResponse> resumen() {
        return ResponseEntity.ok(reporteService.resumen());
    }

    @GetMapping("/categoria")
    public ResponseEntity<List<ReporteItemResponse>> porCategoria() {
        return ResponseEntity.ok(reporteService.porCategoria());
    }

    @GetMapping("/estado")
    public ResponseEntity<List<ReporteItemResponse>> porEstado() {
        return ResponseEntity.ok(reporteService.porEstado());
    }

    @GetMapping("/prioridad")
    public ResponseEntity<List<ReporteItemResponse>> porPrioridad() {
        return ResponseEntity.ok(reporteService.porPrioridad());
    }
}