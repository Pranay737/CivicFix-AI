package com.civicfix.service;

import com.civicfix.domain.*;
import com.civicfix.dto.*;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ForbiddenException;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.*;
import com.civicfix.security.SecurityUtils;
import com.civicfix.security.UserPrincipal;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository complaintImageRepository;
    private final ComplaintAssignmentRepository complaintAssignmentRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ResolutionRepository resolutionRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final com.civicfix.ai.ComplaintAnalysisService complaintAnalysisService;

    @Transactional
    public ComplaintDto createComplaint(CreateComplaintRequest request, Long citizenId) {
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        } else if (category != null && category.getDepartment() != null) {
            department = category.getDepartment();
        }

        Priority priority = category != null ? category.getDefaultPriority() : Priority.MEDIUM;
        String trackingNumber = generateTrackingNumber();

        Complaint complaint = Complaint.builder()
                .trackingNumber(trackingNumber)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .citizen(citizen)
                .category(category)
                .department(department)
                .status(ComplaintStatus.SUBMITTED)
                .priority(priority)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .build();

        // Calculate SLA due date if category is present
        if (category != null) {
            complaint.setSlaDueAt(calculateSlaDueDate(category.getId(), priority));
        }

        complaint = complaintRepository.save(complaint);

        // Save attached images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ComplaintImage> imgList = new ArrayList<>();
            for (String imgUrl : request.getImageUrls()) {
                ComplaintImage img = ComplaintImage.builder()
                        .complaint(complaint)
                        .imageUrl(imgUrl)
                        .build();
                imgList.add(complaintImageRepository.save(img));
            }
            complaint.setImages(imgList);
        }

        // Record initial status history
        ComplaintStatusHistory initialHistory = recordStatusHistory(complaint, null, ComplaintStatus.SUBMITTED, citizen, "Complaint filed by citizen.");
        if (complaint.getStatusHistories() == null) {
            complaint.setStatusHistories(new ArrayList<>());
        }
        complaint.getStatusHistories().add(initialHistory);

        // Trigger automated AI triage & duplicate detection
        complaintAnalysisService.analyzeAndEnrichSync(complaint.getId());

        // Reload enriched complaint from database
        complaint = complaintRepository.findById(complaint.getId()).orElse(complaint);

        log.info("Complaint created successfully with tracking number: {}", trackingNumber);
        return enrichComplaintDto(complaint);
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        validateViewAccess(complaint);

        ComplaintDto dto = ComplaintDto.fromEntity(complaint);
        // Attach active assigned officer details
        complaintAssignmentRepository.findByComplaintIdAndStatus(complaintId, "ACTIVE")
                .ifPresent(assignment -> dto.setAssignedOfficer(UserDto.fromEntity(assignment.getOfficer())));

        return dto;
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaintByTrackingNumber(String trackingNumber) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with tracking number: " + trackingNumber));

        ComplaintDto dto = ComplaintDto.fromEntity(complaint);
        // For public tracking, obscure citizen email/name slightly if not authenticated citizen
        if (dto.getCitizenName() != null && dto.getCitizenName().length() > 2) {
            dto.setCitizenName(dto.getCitizenName().charAt(0) + "*** " + dto.getCitizenName().substring(dto.getCitizenName().lastIndexOf(" ") + 1));
        }
        dto.setCitizenEmail(null);
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getMyComplaints(Long citizenId, Pageable pageable) {
        return complaintRepository.findByCitizenId(citizenId, pageable)
                .map(this::enrichComplaintDto);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getDepartmentComplaints(Long departmentId, ComplaintStatus status, Pageable pageable) {
        if (status != null) {
            return complaintRepository.findByDepartmentIdAndStatus(departmentId, status, pageable)
                    .map(this::enrichComplaintDto);
        }
        return complaintRepository.findByDepartmentId(departmentId, pageable)
                .map(this::enrichComplaintDto);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getAssignedComplaints(Long officerId, ComplaintStatus status, Pageable pageable) {
        if (status != null) {
            return complaintRepository.findByAssignedOfficerIdAndStatus(officerId, status, pageable)
                    .map(this::enrichComplaintDto);
        }
        return complaintRepository.findByAssignedOfficerId(officerId, pageable)
                .map(this::enrichComplaintDto);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAll(pageable)
                .map(this::enrichComplaintDto);
    }

    @Transactional
    public ComplaintDto assignOfficer(Long complaintId, AssignOfficerRequest request, Long assignedById) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + assignedById));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + request.getOfficerId()));

        if (officer.getRole() != Role.OFFICER) {
            throw new BadRequestException("Selected user is not an Officer");
        }

        // Validate department matching
        if (complaint.getDepartment() != null && officer.getDepartment() != null &&
                !complaint.getDepartment().getId().equals(officer.getDepartment().getId())) {
            throw new BadRequestException("Officer belongs to " + officer.getDepartment().getName() +
                    ", but complaint is routed to " + complaint.getDepartment().getName());
        }

        // Deactivate previous assignments
        complaintAssignmentRepository.findByComplaintIdAndStatus(complaintId, "ACTIVE")
                .ifPresent(prev -> {
                    prev.setStatus("REASSIGNED");
                    complaintAssignmentRepository.save(prev);
                });

        // Create new assignment
        ComplaintAssignment assignment = ComplaintAssignment.builder()
                .complaint(complaint)
                .officer(officer)
                .assignedBy(assignedBy)
                .status("ACTIVE")
                .notes(request.getNotes())
                .build();
        complaintAssignmentRepository.save(assignment);

        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaintRepository.save(complaint);

        String comment = "Assigned to officer " + officer.getFullName() +
                (request.getNotes() != null && !request.getNotes().isBlank() ? ": " + request.getNotes() : "");
        recordStatusHistory(complaint, prevStatus, ComplaintStatus.ASSIGNED, assignedBy, comment);

        // Notify officer
        sendNotification(officer,
                "New Complaint Assigned: " + complaint.getTrackingNumber(),
                "You have been assigned to handle complaint #" + complaint.getTrackingNumber() + " - " + complaint.getTitle(),
                "ASSIGNMENT",
                "/officer/complaints/" + complaint.getId());

        // Notify citizen
        sendNotification(complaint.getCitizen(),
                "Officer Assigned to Your Complaint",
                "Officer " + officer.getFullName() + " has been assigned to your issue #" + complaint.getTrackingNumber(),
                "STATUS_UPDATE",
                "/citizen/complaints/" + complaint.getId());

        return enrichComplaintDto(complaint);
    }

    @Transactional
    public ComplaintDto updateStatus(Long complaintId, UpdateStatusRequest request, Long userId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ComplaintStatus currentStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        // Validate allowed transitions
        validateStatusTransition(currentStatus, newStatus);

        complaint.setStatus(newStatus);
        complaintRepository.save(complaint);

        recordStatusHistory(complaint, currentStatus, newStatus, user, request.getComment());

        // Notify citizen
        sendNotification(complaint.getCitizen(),
                "Complaint Status Updated: " + newStatus,
                "Your complaint #" + complaint.getTrackingNumber() + " status is now " + newStatus + ".",
                "STATUS_UPDATE",
                "/citizen/complaints/" + complaint.getId());

        return enrichComplaintDto(complaint);
    }

    @Transactional
    public ComplaintDto resolveComplaint(Long complaintId, ResolveComplaintRequest request, Long officerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (complaint.getStatus() == ComplaintStatus.CLOSED ||
            complaint.getStatus() == ComplaintStatus.REJECTED ||
            complaint.getStatus() == ComplaintStatus.DUPLICATE) {
            throw new BadRequestException("Cannot resolve a complaint with status " + complaint.getStatus());
        }

        String evidenceJson = null;
        if (request.getEvidenceImageUrls() != null && !request.getEvidenceImageUrls().isEmpty()) {
            try {
                evidenceJson = objectMapper.writeValueAsString(request.getEvidenceImageUrls());
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize evidence images", e);
            }
        }

        Resolution resolution = Resolution.builder()
                .complaint(complaint)
                .officer(officer)
                .notes(request.getNotes())
                .evidenceImagesJson(evidenceJson)
                .build();
        resolutionRepository.save(resolution);

        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaintRepository.save(complaint);

        recordStatusHistory(complaint, prevStatus, ComplaintStatus.RESOLVED, officer,
                "Complaint resolved by officer. Resolution note: " + request.getNotes());

        // Notify citizen for verification
        sendNotification(complaint.getCitizen(),
                "Action Required: Complaint Resolved #" + complaint.getTrackingNumber(),
                "Officer " + officer.getFullName() + " has resolved your complaint. Please verify and confirm resolution.",
                "RESOLUTION",
                "/citizen/complaints/" + complaint.getId());

        return enrichComplaintDto(complaint);
    }

    @Transactional
    public ComplaintDto verifyResolution(Long complaintId, VerifyComplaintRequest request, Long citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new ForbiddenException("Only the citizen who reported this issue can verify resolution.");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Only complaints in RESOLVED status can be verified.");
        }

        if (request.isVerified()) {
            // Citizen accepts resolution -> CLOSED
            complaint.setStatus(ComplaintStatus.CLOSED);
            complaintRepository.save(complaint);

            String comment = "Resolution accepted and complaint closed by citizen." +
                    (request.getComment() != null ? " Feedback: " + request.getComment() : "");
            recordStatusHistory(complaint, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, citizen, comment);

            if (request.getRating() != null) {
                Feedback feedback = Feedback.builder()
                        .complaint(complaint)
                        .citizen(citizen)
                        .rating(request.getRating())
                        .comment(request.getComment())
                        .build();
                feedbackRepository.save(feedback);
            }
        } else {
            // Citizen rejects resolution -> REOPENED
            complaint.setStatus(ComplaintStatus.REOPENED);
            complaintRepository.save(complaint);

            String reason = request.getComment() != null && !request.getComment().isBlank() ?
                    request.getComment() : "Citizen reported that issue was not resolved satisfactorily.";
            recordStatusHistory(complaint, ComplaintStatus.RESOLVED, ComplaintStatus.REOPENED, citizen, "Reopened: " + reason);

            // Notify Department Admin
            if (complaint.getDepartment() != null) {
                userRepository.findByDepartmentIdAndRole(complaint.getDepartment().getId(), Role.DEPARTMENT_ADMIN)
                        .forEach(admin -> sendNotification(admin,
                                "Complaint Reopened: #" + complaint.getTrackingNumber(),
                                "Citizen reopened complaint #" + complaint.getTrackingNumber() + ": " + reason,
                                "STATUS_UPDATE",
                                "/dept-admin/complaints/" + complaint.getId()));
            }
        }

        return enrichComplaintDto(complaint);
    }

    @Transactional
    public FeedbackDto submitFeedback(Long complaintId, FeedbackDto feedbackDto, Long citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new ForbiddenException("You can only submit feedback for your own complaint.");
        }

        Feedback feedback = feedbackRepository.findByComplaintId(complaintId)
                .orElseGet(() -> Feedback.builder().complaint(complaint).citizen(citizen).build());

        feedback.setRating(feedbackDto.getRating());
        feedback.setComment(feedbackDto.getComment());
        feedback = feedbackRepository.save(feedback);

        return FeedbackDto.fromEntity(feedback);
    }

    @Transactional
    public ComplaintDto triageOverride(Long complaintId, TriageOverrideRequest request, Long adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + adminId));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            complaint.setCategory(category);
            if (category.getDepartment() != null) {
                complaint.setDepartment(category.getDepartment());
            }
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            complaint.setDepartment(department);
        }

        if (request.getPriority() != null) {
            complaint.setPriority(request.getPriority());
        }

        // Recalculate SLA due date
        if (complaint.getCategory() != null) {
            complaint.setSlaDueAt(calculateSlaDueDate(complaint.getCategory().getId(), complaint.getPriority()));
        }

        if (complaint.getStatus() == ComplaintStatus.SUBMITTED) {
            complaint.setStatus(ComplaintStatus.REGISTERED);
        }

        complaint = complaintRepository.save(complaint);

        String note = "Admin triaged/overrode complaint parameters." +
                (request.getReason() != null ? " Reason: " + request.getReason() : "");
        recordStatusHistory(complaint, complaint.getStatus(), complaint.getStatus(), admin, note);

        return enrichComplaintDto(complaint);
    }

    // --- Helpers ---

    private String generateTrackingNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "CFX-" + datePart + "-" + randomSuffix;
    }

    private LocalDateTime calculateSlaDueDate(Long categoryId, Priority priority) {
        return slaPolicyRepository.findByCategoryIdAndPriority(categoryId, priority)
                .map(policy -> LocalDateTime.now().plusHours(policy.getResolutionHours()))
                .orElseGet(() -> LocalDateTime.now().plusHours(48)); // default 48h
    }

    private void validateStatusTransition(ComplaintStatus current, ComplaintStatus next) {
        if (current == next) return;

        boolean allowed = switch (current) {
            case SUBMITTED -> next == ComplaintStatus.REGISTERED || next == ComplaintStatus.REJECTED || next == ComplaintStatus.DUPLICATE;
            case REGISTERED -> next == ComplaintStatus.ASSIGNED || next == ComplaintStatus.REJECTED || next == ComplaintStatus.DUPLICATE;
            case ASSIGNED -> next == ComplaintStatus.IN_PROGRESS || next == ComplaintStatus.ASSIGNED || next == ComplaintStatus.REJECTED;
            case IN_PROGRESS -> next == ComplaintStatus.RESOLVED || next == ComplaintStatus.ASSIGNED;
            case RESOLVED -> next == ComplaintStatus.CLOSED || next == ComplaintStatus.REOPENED;
            case REOPENED -> next == ComplaintStatus.ASSIGNED || next == ComplaintStatus.IN_PROGRESS || next == ComplaintStatus.RESOLVED;
            case CLOSED, REJECTED, DUPLICATE -> false;
        };

        if (!allowed) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private void validateViewAccess(Complaint complaint) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        switch (currentUser.getRole()) {
            case CITIZEN -> {
                if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("You can only access your own complaints");
                }
            }
            case OFFICER -> {
                // Officer can view if assigned or belonging to department
                boolean isAssigned = complaintAssignmentRepository.findByComplaintIdAndStatus(complaint.getId(), "ACTIVE")
                        .map(a -> a.getOfficer().getId().equals(currentUser.getId()))
                        .orElse(false);
                boolean sameDept = complaint.getDepartment() != null &&
                        complaint.getDepartment().getId().equals(currentUser.getDepartmentId());
                if (!isAssigned && !sameDept) {
                    throw new ForbiddenException("You can only access complaints in your department or assigned to you");
                }
            }
            case DEPARTMENT_ADMIN -> {
                if (complaint.getDepartment() != null &&
                        !complaint.getDepartment().getId().equals(currentUser.getDepartmentId())) {
                    throw new ForbiddenException("You can only access complaints in your assigned department");
                }
            }
            case SYSTEM_ADMIN -> {
                // Allowed all
            }
        }
    }

    private ComplaintStatusHistory recordStatusHistory(Complaint complaint, ComplaintStatus prev, ComplaintStatus next, User user, String comment) {
        ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                .complaint(complaint)
                .previousStatus(prev)
                .newStatus(next)
                .changedBy(user)
                .comment(comment)
                .build();
        return statusHistoryRepository.save(history);
    }

    private void sendNotification(User user, String title, String message, String type, String linkUrl) {
        if (user == null) return;
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .linkUrl(linkUrl)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private ComplaintDto enrichComplaintDto(Complaint complaint) {
        ComplaintDto dto = ComplaintDto.fromEntity(complaint);
        complaintAssignmentRepository.findByComplaintIdAndStatus(complaint.getId(), "ACTIVE")
                .ifPresent(a -> dto.setAssignedOfficer(UserDto.fromEntity(a.getOfficer())));
        List<ComplaintStatusHistory> histories = statusHistoryRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId());
        if (!histories.isEmpty()) {
            dto.setTimeline(histories.stream().map(ComplaintStatusHistoryDto::fromEntity).toList());
        }
        List<ComplaintImage> images = complaintImageRepository.findByComplaintId(complaint.getId());
        if (!images.isEmpty()) {
            dto.setImages(images.stream().map(ComplaintImageDto::fromEntity).toList());
        }
        resolutionRepository.findFirstByComplaintIdOrderByResolvedAtDesc(complaint.getId())
                .ifPresent(r -> dto.setResolution(ResolutionDto.fromEntity(r)));
        feedbackRepository.findByComplaintId(complaint.getId())
                .ifPresent(f -> dto.setFeedback(FeedbackDto.fromEntity(f)));
        return dto;
    }
}
