package com.project.tecnologistik.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tecnologistik.dto.AnalizarTicketRequest;
import com.project.tecnologistik.dto.AnalizarTicketResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@Service
public class GeminiIaService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public AnalizarTicketResponse analizarTicket(AnalizarTicketRequest request) {
        try {
            String prompt = crearPromptTexto(request);

            String body = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": %s
                        }
                      ]
                    }
                  ]
                }
                """.formatted(mapper.writeValueAsString(prompt));

            return enviarAGemini(body);

        } catch (Exception e) {
            return respuestaFallback();
        }
    }

    public AnalizarTicketResponse analizarTicketConImagen(
            AnalizarTicketRequest request,
            MultipartFile imagen
    ) {
        try {
            String prompt = crearPromptImagen(request);

            String mimeType = imagen.getContentType();

            if (mimeType == null || mimeType.isBlank()) {
                mimeType = "image/png";
            }

            String base64Imagen = Base64.getEncoder().encodeToString(imagen.getBytes());

            String body = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": %s
                        },
                        {
                          "inline_data": {
                            "mime_type": %s,
                            "data": %s
                          }
                        }
                      ]
                    }
                  ]
                }
                """.formatted(
                    mapper.writeValueAsString(prompt),
                    mapper.writeValueAsString(mimeType),
                    mapper.writeValueAsString(base64Imagen)
            );

            return enviarAGemini(body);

        } catch (Exception e) {
            return new AnalizarTicketResponse(
                    "INCIDENCIA",
                    "TECNICO",
                    "MEDIA",
                    "No se pudo analizar la imagen con IA. El ticket será revisado por el equipo de soporte."
            );
        }
    }

    private AnalizarTicketResponse enviarAGemini(String body) throws Exception {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model
                + ":generateContent?key="
                + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
        );

        JsonNode root = mapper.readTree(response.getBody());

        String text = root
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        text = text
                .replace("```json", "")
                .replace("```", "")
                .trim();

        return mapper.readValue(text, AnalizarTicketResponse.class);
    }

    private String crearPromptTexto(AnalizarTicketRequest request) {
        return """
            Eres un asistente IA para un sistema de tickets.

            Analiza el ticket del cliente y responde SOLO JSON válido.

            Reglas:
            - Si es problema técnico: areaDestino = TECNICO.
            - Si es solicitud de nuevo módulo, mejora, cambio, reportes o permisos especiales: areaDestino = ADMIN.
            - tipoSolicitud: INCIDENCIA, CONSULTA o REQUERIMIENTO.
            - prioridad: BAJA, MEDIA o ALTA.
            - respuestaSugerida debe ser breve, clara y útil para el cliente.

            Título: %s
            Descripción: %s

            Formato:
            {
              "tipoSolicitud": "",
              "areaDestino": "",
              "prioridad": "",
              "respuestaSugerida": ""
            }
            """.formatted(request.getTitulo(), request.getDescripcion());
    }

    private String crearPromptImagen(AnalizarTicketRequest request) {
        return """
            Eres un asistente IA para un sistema de tickets.

            Analiza el ticket del cliente y también la imagen adjunta.
            La imagen puede ser una captura de error, pantalla del sistema,
            comprobante o evidencia del problema.

            Responde SOLO JSON válido.

            Reglas:
            - Si es problema técnico: areaDestino = TECNICO.
            - Si es solicitud de nuevo módulo, mejora, cambio, reportes o permisos especiales: areaDestino = ADMIN.
            - tipoSolicitud: INCIDENCIA, CONSULTA o REQUERIMIENTO.
            - prioridad: BAJA, MEDIA o ALTA.
            - respuestaSugerida debe ser breve, clara y útil para el cliente.
            - Si la imagen muestra un error grave, prioridad = ALTA.
            - Si la imagen no aporta información clara, analiza usando título y descripción.

            Título: %s
            Descripción: %s

            Formato:
            {
              "tipoSolicitud": "",
              "areaDestino": "",
              "prioridad": "",
              "respuestaSugerida": ""
            }
            """.formatted(request.getTitulo(), request.getDescripcion());
    }

    private AnalizarTicketResponse respuestaFallback() {
        return new AnalizarTicketResponse(
                "INCIDENCIA",
                "TECNICO",
                "MEDIA",
                "No se pudo analizar con IA. El ticket será revisado por el equipo de soporte."
        );
    }
}