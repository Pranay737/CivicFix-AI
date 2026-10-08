package com.civicfix.controller;

import com.civicfix.dto.CategoryDto;
import com.civicfix.dto.DepartmentDto;
import com.civicfix.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Endpoints for retrieving departments and categories")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "List all active departments")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllActiveDepartments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping("/{id}/categories")
    @Operation(summary = "List categories belonging to a department")
    public ResponseEntity<List<CategoryDto>> getCategoriesByDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getCategoriesByDepartment(id));
    }
}
