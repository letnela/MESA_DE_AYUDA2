package com.project.tecnologistik.controller;

import com.project.tecnologistik.dto.DashboardResponse;
import com.project.tecnologistik.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> obtenerDashboard() {
        return ResponseEntity.ok(
                dashboardService.obtenerDashboard()
        );
    }
}