package com.civicfix.dto;

import com.civicfix.domain.Complaint;
import com.civicfix.domain.ComplaintStatus;
import com.civicfix.domain.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDto {
    private Long id;
    private String trackingNumber;
    private String title;
    private String description;

    // Citizen Info
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;

    // Categorization
    private Long categoryId;
    private String categoryName;
    private Long departmentId;
    private String departmentName;

    // Status and Priority
    private ComplaintStatus status;
    private Priority priority;

    // Geo Location
    private Double latitude;
    private Double longitude;
    private String address;

    // AI Fields
    private String aiCategorySuggestion;
    private String aiDepartmentSuggestion;
    private String aiPrioritySuggestion;
    private Double aiConfidence;
    private String aiReasoning;
    private String aiSummary;

    // Duplicate Detection
    private boolean isDuplicate;
    private Long duplicateOfId;
    private String duplicateOfTrackingNumber;
    private Double similarityScore;

    // SLA & Timestamps
    private LocalDateTime slaDueAt;
    private boolean isOverdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Related Data
    private List<ComplaintImageDto> images;
    private UserDto assignedOfficer;
    private List<ComplaintStatusHistoryDto> timeline;
    private ResolutionDto resolution;
    private FeedbackDto feedback;

    public static ComplaintDto fromEntity(Complaint complaint) {
        if (complaint == null) return null;

        boolean overdue = complaint.getSlaDueAt() != null &&
                LocalDateTime.now().isAfter(complaint.getSlaDueAt()) &&
                complaint.getStatus() != ComplaintStatus.RESOLVED &&
                complaint.getStatus() != ComplaintStatus.CLOSED &&
                complaint.getStatus() != ComplaintStatus.REJECTED;

        UserDto officerDto = null;
        if (complaint.getAssignments() != null && !complaint.getAssignments().isEmpty()) {
            complaint.getAssignments().stream()
                    .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                    .findFirst()
                    .ifPresent(a -> {});
        }

        return ComplaintDto.builder()
                .id(complaint.getId())
                .trackingNumber(complaint.getTrackingNumber())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .citizenId(complaint.getCitizen() != null ? complaint.getCitizen().getId() : null)
                .citizenName(complaint.getCitizen() != null ? complaint.getCitizen().getFullName() : null)
                .citizenEmail(complaint.getCitizen() != null ? complaint.getCitizen().getEmail() : null)
                .categoryId(complaint.getCategory() != null ? complaint.getCategory().getId() : null)
                .categoryName(complaint.getCategory() != null ? complaint.getCategory().getName() : null)
                .departmentId(complaint.getDepartment() != null ? complaint.getDepartment().getId() : null)
                .departmentName(complaint.getDepartment() != null ? complaint.getDepartment().getName() : null)
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .address(complaint.getAddress())
                .aiCategorySuggestion(complaint.getAiCategorySuggestion())
                .aiDepartmentSuggestion(complaint.getAiDepartmentSuggestion())
                .aiPrioritySuggestion(complaint.getAiPrioritySuggestion())
                .aiConfidence(complaint.getAiConfidence())
                .aiReasoning(complaint.getAiReasoning())
                .aiSummary(complaint.getAiSummary())
                .isDuplicate(complaint.isDuplicate())
                .duplicateOfId(complaint.getDuplicateOf() != null ? complaint.getDuplicateOf().getId() : null)
                .duplicateOfTrackingNumber(complaint.getDuplicateOf() != null ? complaint.getDuplicateOf().getTrackingNumber() : null)
                .similarityScore(complaint.getSimilarityScore())
                .slaDueAt(complaint.getSlaDueAt())
                .isOverdue(overdue)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .images(complaint.getImages() != null ? complaint.getImages().stream().map(ComplaintImageDto::fromEntity).toList() : List.of())
                .timeline(complaint.getStatusHistories() != null ? complaint.getStatusHistories().stream().map(ComplaintStatusHistoryDto::fromEntity).toList() : List.of())
                .resolution(ResolutionDto.fromEntity(complaint.getResolution()))
                .feedback(FeedbackDto.fromEntity(complaint.getFeedback()))
                .build();
    }
}
