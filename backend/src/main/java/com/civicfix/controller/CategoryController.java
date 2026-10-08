package com.civicfix.controller;

import com.civicfix.dto.CategoryDto;
import com.civicfix.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Endpoints for retrieving civic issue categories")
public class CategoryController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "List all active civic issue categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(departmentService.getAllActiveCategories());
    }
}
