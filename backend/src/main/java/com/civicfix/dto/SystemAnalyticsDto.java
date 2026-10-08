package com.civicfix.dto;

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
public class SystemAnalyticsDto {
    private long totalComplaints;
    private long openComplaints;
    private long resolvedComplaints;
    private long totalOverdue;
    private double overallSlaComplianceRate;
    private Double overallAverageRating;

    private long totalCitizens;
    private long totalOfficers;
    private long totalDepartments;

    private List<DepartmentMetricDto> departmentMetrics;
    private List<CategoryMetricDto> categoryMetrics;
    private List<AuditLogDto> recentAuditLogs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentMetricDto {
        private Long departmentId;
        private String departmentName;
        private long complaintCount;
        private double slaCompliance;
        private Double avgRating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMetricDto {
        private Long categoryId;
        private String categoryName;
        private String departmentName;
        private long complaintCount;
    }
}
