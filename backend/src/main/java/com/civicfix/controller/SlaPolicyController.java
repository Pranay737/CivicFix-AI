package com.civicfix.controller;

import com.civicfix.dto.SlaPolicyDto;
import com.civicfix.service.SlaPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sla-policies")
@RequiredArgsConstructor
@Tag(name = "SLA Policies", description = "Endpoints for managing SLA resolution times across categories and priorities")
public class SlaPolicyController {

    private final SlaPolicyService slaPolicyService;

    @GetMapping
    @Operation(summary = "Get all configured SLA policies")
    public ResponseEntity<List<SlaPolicyDto>> getAllPolicies() {
        return ResponseEntity.ok(slaPolicyService.getAllPolicies());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Update resolution SLA hours for category and priority (System Admin only)")
    public ResponseEntity<SlaPolicyDto> updatePolicy(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int hours = body.getOrDefault("resolutionHours", 48);
        return ResponseEntity.ok(slaPolicyService.updatePolicy(id, hours));
    }
}
