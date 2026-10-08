package com.civicfix.controller;

import com.civicfix.domain.ComplaintStatus;
import com.civicfix.dto.*;
import com.civicfix.security.SecurityUtils;
import com.civicfix.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Endpoints for managing civic issue complaints and lifecycle workflow")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Report a new civic issue (Citizen only)")
    public ResponseEntity<ComplaintDto> createComplaint(@Valid @RequestBody CreateComplaintRequest request) {
        Long citizenId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.createComplaint(request, citizenId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Get list of complaints reported by current citizen")
    public ResponseEntity<Page<ComplaintDto>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(complaintService.getMyComplaints(SecurityUtils.getCurrentUserId(), pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed complaint record with status history and resolution")
    public ResponseEntity<ComplaintDto> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Public tracking of complaint by tracking number (e.g. CFX-20261008-ABCD)")
    public ResponseEntity<ComplaintDto> trackComplaint(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(complaintService.getComplaintByTrackingNumber(trackingNumber));
    }

    @GetMapping("/department")
    @PreAuthorize("hasAnyRole('DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get department complaints for triage and monitoring")
    public ResponseEntity<Page<ComplaintDto>> getDepartmentComplaints(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Long targetDeptId = departmentId;
        if (targetDeptId == null && SecurityUtils.isDeptAdmin()) {
            targetDeptId = SecurityUtils.getCurrentUserDepartmentId();
        }

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (targetDeptId != null) {
            return ResponseEntity.ok(complaintService.getDepartmentComplaints(targetDeptId, status, pageable));
        } else {
            return ResponseEntity.ok(complaintService.getAllComplaints(pageable));
        }
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('OFFICER')")
    @Operation(summary = "Get complaints assigned to current officer")
    public ResponseEntity<Page<ComplaintDto>> getAssignedComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(complaintService.getAssignedComplaints(SecurityUtils.getCurrentUserId(), status, pageable));
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Get all complaints system-wide (System Admin only)")
    public ResponseEntity<Page<ComplaintDto>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(complaintService.getAllComplaints(pageable));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Assign or reassign complaint to an officer")
    public ResponseEntity<ComplaintDto> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody AssignOfficerRequest request) {
        return ResponseEntity.ok(complaintService.assignOfficer(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OFFICER', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Update complaint status (e.g. IN_PROGRESS)")
    public ResponseEntity<ComplaintDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('OFFICER')")
    @Operation(summary = "Submit resolution notes and evidence (Officer only)")
    public ResponseEntity<ComplaintDto> resolveComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ResolveComplaintRequest request) {
        return ResponseEntity.ok(complaintService.resolveComplaint(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Citizen verification of resolution (accept to close, or reject to reopen)")
    public ResponseEntity<ComplaintDto> verifyComplaint(
            @PathVariable Long id,
            @Valid @RequestBody VerifyComplaintRequest request) {
        return ResponseEntity.ok(complaintService.verifyResolution(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit rating and feedback for resolved complaint")
    public ResponseEntity<FeedbackDto> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackDto request) {
        return ResponseEntity.ok(complaintService.submitFeedback(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{id}/triage")
    @PreAuthorize("hasAnyRole('DEPARTMENT_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Override AI categorization, department routing, or priority")
    public ResponseEntity<ComplaintDto> triageOverride(
            @PathVariable Long id,
            @RequestBody TriageOverrideRequest request) {
        return ResponseEntity.ok(complaintService.triageOverride(id, request, SecurityUtils.getCurrentUserId()));
    }
}
