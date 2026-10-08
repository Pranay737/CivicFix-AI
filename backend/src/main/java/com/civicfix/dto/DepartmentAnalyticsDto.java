package com.civicfix.dto;

import com.civicfix.domain.ComplaintStatus;
import com.civicfix.domain.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAnalyticsDto {
    private Long departmentId;
    private String departmentName;
    private long totalComplaints;
    private long openComplaints;
    private long resolvedComplaints;
    private long overdueComplaints;
    private double slaComplianceRate; // percentage (e.g. 92.5)
    private double averageResolutionHours;
    private Double averageRating;
    private long totalRatings;
    private Map<ComplaintStatus, Long> statusDistribution;
    private Map<Priority, Long> priorityDistribution;
    private List<OfficerWorkloadDto> officerWorkload;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfficerWorkloadDto {
        private Long officerId;
        private String officerName;
        private String officerEmail;
        private long activeAssignments;
        private long completedAssignments;
    }
}
