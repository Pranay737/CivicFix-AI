package com.civicfix.controller;

import com.civicfix.dto.DepartmentAnalyticsDto;
import com.civicfix.dto.SystemAnalyticsDto;
import com.civicfix.security.SecurityUtils;
import com.civicfix.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & SLA", description = "Endpoints for department performance, SLA monitoring, and system metrics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/department")
    @PreAuthorize("hasAnyRole('DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get department analytics and SLA performance")
    public ResponseEntity<DepartmentAnalyticsDto> getDepartmentAnalytics(@RequestParam(required = false) Long departmentId) {
        Long targetDeptId = departmentId;
        if (targetDeptId == null && SecurityUtils.isDeptAdmin()) {
            targetDeptId = SecurityUtils.getCurrentUserDepartmentId();
        }
        if (targetDeptId == null) {
            targetDeptId = 1L; // default to first department if system admin doesn't pass one
        }
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(targetDeptId));
    }

    @GetMapping("/system")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Get system-wide analytics, cross-department trends and audit logs")
    public ResponseEntity<SystemAnalyticsDto> getSystemAnalytics() {
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }
}
