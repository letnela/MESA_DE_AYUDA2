package com.project.tecnologistik.controller;

import com.project.tecnologistik.dto.AnalizarTicketRequest;
import com.project.tecnologistik.dto.AnalizarTicketResponse;
import com.project.tecnologistik.service.GeminiIaService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin("*")
public class IaController {

    private final GeminiIaService geminiIaService;

    public IaController(GeminiIaService geminiIaService) {
        this.geminiIaService = geminiIaService;
    }

    @PostMapping(
            value = "/analizar-ticket",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AnalizarTicketResponse> analizarTicket(
            @RequestPart("ticket") AnalizarTicketRequest request,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos
    ) {

        MultipartFile primeraImagen = obtenerPrimeraImagen(archivos);

        AnalizarTicketResponse response;

        if (primeraImagen != null) {
            response = geminiIaService.analizarTicketConImagen(request, primeraImagen);
        } else {
            response = geminiIaService.analizarTicket(request);
        }

        return ResponseEntity.ok(response);
    }

    private MultipartFile obtenerPrimeraImagen(List<MultipartFile> archivos) {

        if (archivos == null || archivos.isEmpty()) {
            return null;
        }

        for (MultipartFile archivo : archivos) {

            String tipo = archivo.getContentType();

            if (tipo != null && tipo.startsWith("image/")) {
                return archivo;
            }
        }

        return null;
    }
}