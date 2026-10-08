package com.civicfix.controller;

import com.civicfix.domain.Department;
import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import com.civicfix.dto.UserDto;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.DepartmentRepository;
import com.civicfix.repository.UserRepository;
import com.civicfix.security.SecurityUtils;
import com.civicfix.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Tag(name = "User Management", description = "Endpoints for administering users, officer assignments, and roles")
public class UserController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Get list of all users with pagination and filtering (System Admin only)")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userRepository.findAll(pageable).map(UserDto::fromEntity));
    }

    @GetMapping("/officers")
    @PreAuthorize("hasAnyRole('DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get officers available in a department for assignment")
    public ResponseEntity<List<UserDto>> getOfficersByDepartment(@RequestParam(required = false) Long departmentId) {
        Long targetDeptId = departmentId;
        if (targetDeptId == null && SecurityUtils.isDeptAdmin()) {
            targetDeptId = SecurityUtils.getCurrentUserDepartmentId();
        }
        if (targetDeptId != null) {
            return ResponseEntity.ok(userRepository.findByDepartmentIdAndRole(targetDeptId, Role.OFFICER)
                    .stream().map(UserDto::fromEntity).toList());
        }
        return ResponseEntity.ok(userRepository.findByRole(Role.OFFICER)
                .stream().map(UserDto::fromEntity).toList());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Transactional
    @Operation(summary = "Update user role (System Admin only)")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        Role newRole = Role.valueOf(body.get("role"));
        user.setRole(newRole);
        user = userRepository.save(user);

        auditLogService.logAction(SecurityUtils.getCurrentUserId(), "UPDATE_USER_ROLE", "USER",
                String.valueOf(id), "Updated role of " + user.getEmail() + " to " + newRole, null);

        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @PatchMapping("/{id}/department")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Transactional
    @Operation(summary = "Assign department to officer or department admin (System Admin only)")
    public ResponseEntity<UserDto> assignDepartment(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        Long deptId = body.get("departmentId");
        Department dept = deptId != null ? departmentRepository.findById(deptId).orElse(null) : null;
        user.setDepartment(dept);
        user = userRepository.save(user);

        auditLogService.logAction(SecurityUtils.getCurrentUserId(), "ASSIGN_USER_DEPARTMENT", "USER",
                String.valueOf(id), "Assigned department " + (dept != null ? dept.getName() : "None") + " to " + user.getEmail(), null);

        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Transactional
    @Operation(summary = "Enable or disable user account (System Admin only)")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        boolean active = body.getOrDefault("active", true);
        user.setActive(active);
        user = userRepository.save(user);

        auditLogService.logAction(SecurityUtils.getCurrentUserId(), "TOGGLE_USER_STATUS", "USER",
                String.valueOf(id), "Set active=" + active + " for " + user.getEmail(), null);

        return ResponseEntity.ok(UserDto.fromEntity(user));
    }
}
