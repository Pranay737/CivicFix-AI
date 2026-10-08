package com.civicfix.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Root", description = "Root system status and welcome endpoint")
public class RootController {

    @GetMapping("/")
    @Operation(summary = "System status and welcome index")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "CivicFix AI – Civic Issue Reporting, Resolution & Monitoring Platform");
        response.put("status", "UP");
        response.put("version", "1.0.0");
        response.put("frontendUrl", "http://localhost:5173");
        response.put("swaggerUiUrl", "http://localhost:8080/swagger-ui/index.html");
        response.put("apiDocumentation", "http://localhost:8080/v3/api-docs");
        response.put("message", "Welcome to CivicFix AI REST API. Access the interactive Web Portal at http://localhost:5173, or explore the REST API via Swagger UI at http://localhost:8080/swagger-ui/index.html.");
        return ResponseEntity.ok(response);
    }
}
