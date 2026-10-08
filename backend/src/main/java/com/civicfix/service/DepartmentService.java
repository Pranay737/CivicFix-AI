package com.civicfix.service;

import com.civicfix.domain.Category;
import com.civicfix.domain.Department;
import com.civicfix.dto.CategoryDto;
import com.civicfix.dto.DepartmentDto;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.CategoryRepository;
import com.civicfix.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllActiveDepartments() {
        return departmentRepository.findAllByActiveTrue().stream()
                .map(DepartmentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return DepartmentDto.fromEntity(dept);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findAllByActiveTrue().stream()
                .map(CategoryDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesByDepartment(Long departmentId) {
        return categoryRepository.findByDepartmentId(departmentId).stream()
                .map(CategoryDto::fromEntity)
                .toList();
    }
}
