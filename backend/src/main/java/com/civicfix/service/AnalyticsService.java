package com.civicfix.service;

import com.civicfix.domain.*;
import com.civicfix.dto.DepartmentAnalyticsDto;
import com.civicfix.dto.SystemAnalyticsDto;
import com.civicfix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public DepartmentAnalyticsDto getDepartmentAnalytics(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId).orElse(null);
        String deptName = dept != null ? dept.getName() : "Department " + departmentId;

        List<Complaint> complaints = complaintRepository.findByDepartmentIdAndStatusIn(
                departmentId,
                Arrays.asList(ComplaintStatus.values())
        );

        long total = complaints.size();
        long overdue = complaintRepository.countOverdueByDepartmentId(departmentId, LocalDateTime.now());

        Map<ComplaintStatus, Long> statusMap = new HashMap<>();
        Map<Priority, Long> priorityMap = new HashMap<>();
        for (ComplaintStatus s : ComplaintStatus.values()) statusMap.put(s, 0L);
        for (Priority p : Priority.values()) priorityMap.put(p, 0L);

        long resolvedCount = 0;
        long compliantResolvedCount = 0;
        double totalResolutionMinutes = 0.0;
        long resolvedWithTimingCount = 0;

        for (Complaint c : complaints) {
            statusMap.put(c.getStatus(), statusMap.getOrDefault(c.getStatus(), 0L) + 1);
            priorityMap.put(c.getPriority(), priorityMap.getOrDefault(c.getPriority(), 0L) + 1);

            boolean isResolved = (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED);
            if (isResolved) {
                resolvedCount++;
                if (c.getResolution() != null && c.getResolution().getResolvedAt() != null) {
                    LocalDateTime resTime = c.getResolution().getResolvedAt();
                    long minutes = Math.max(0, Duration.between(c.getCreatedAt(), resTime).toMinutes());
                    totalResolutionMinutes += minutes;
                    resolvedWithTimingCount++;

                    if (c.getSlaDueAt() != null && !resTime.isAfter(c.getSlaDueAt())) {
                        compliantResolvedCount++;
                    } else if (c.getSlaDueAt() == null) {
                        compliantResolvedCount++;
                    }
                } else {
                    compliantResolvedCount++;
                }
            }
        }

        double complianceRate = resolvedCount > 0 ?
                Math.round(((double) compliantResolvedCount / resolvedCount) * 1000.0) / 10.0 : 100.0;

        double avgResolutionHours = resolvedWithTimingCount > 0 ?
                Math.round((totalResolutionMinutes / (resolvedWithTimingCount * 60.0)) * 10.0) / 10.0 : 0.0;

        Double avgRating = feedbackRepository.findAverageRatingByDepartmentId(departmentId);
        long totalRatings = feedbackRepository.countByDepartmentId(departmentId);

        // Officer Workload
        List<User> officers = userRepository.findByDepartmentIdAndRole(departmentId, Role.OFFICER);
        List<DepartmentAnalyticsDto.OfficerWorkloadDto> workloadList = new ArrayList<>();

        for (User o : officers) {
            long active = assignmentRepository.countByOfficerIdAndStatus(o.getId(), "ACTIVE");
            long completed = assignmentRepository.countByOfficerIdAndStatus(o.getId(), "COMPLETED");
            workloadList.add(DepartmentAnalyticsDto.OfficerWorkloadDto.builder()
                    .officerId(o.getId())
                    .officerName(o.getFullName())
                    .officerEmail(o.getEmail())
                    .activeAssignments(active)
                    .completedAssignments(completed)
                    .build());
        }

        long openComplaints = total - resolvedCount -
                statusMap.getOrDefault(ComplaintStatus.REJECTED, 0L) -
                statusMap.getOrDefault(ComplaintStatus.DUPLICATE, 0L);

        return DepartmentAnalyticsDto.builder()
                .departmentId(departmentId)
                .departmentName(deptName)
                .totalComplaints(total)
                .openComplaints(Math.max(0, openComplaints))
                .resolvedComplaints(resolvedCount)
                .overdueComplaints(overdue)
                .slaComplianceRate(complianceRate)
                .averageResolutionHours(avgResolutionHours)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                .totalRatings(totalRatings)
                .statusDistribution(statusMap)
                .priorityDistribution(priorityMap)
                .officerWorkload(workloadList)
                .build();
    }

    @Transactional(readOnly = true)
    public SystemAnalyticsDto getSystemAnalytics() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        long total = allComplaints.size();
        long totalOverdue = complaintRepository.countTotalOverdue(LocalDateTime.now());

        long resolved = 0;
        long compliant = 0;

        for (Complaint c : allComplaints) {
            if (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED) {
                resolved++;
                if (c.getResolution() != null && c.getSlaDueAt() != null) {
                    if (!c.getResolution().getResolvedAt().isAfter(c.getSlaDueAt())) {
                        compliant++;
                    }
                } else {
                    compliant++;
                }
            }
        }

        double complianceRate = resolved > 0 ?
                Math.round(((double) compliant / resolved) * 1000.0) / 10.0 : 100.0;

        Double overallRating = feedbackRepository.findOverallAverageRating();

        long totalCitizens = userRepository.countByRole(Role.CITIZEN);
        long totalOfficers = userRepository.countByRole(Role.OFFICER);
        long totalDepts = departmentRepository.count();

        // Department breakdown
        List<SystemAnalyticsDto.DepartmentMetricDto> deptMetrics = new ArrayList<>();
        for (Department d : departmentRepository.findAllByActiveTrue()) {
            DepartmentAnalyticsDto dStats = getDepartmentAnalytics(d.getId());
            deptMetrics.add(SystemAnalyticsDto.DepartmentMetricDto.builder()
                    .departmentId(d.getId())
                    .departmentName(d.getName())
                    .complaintCount(dStats.getTotalComplaints())
                    .slaCompliance(dStats.getSlaComplianceRate())
                    .avgRating(dStats.getAverageRating())
                    .build());
        }

        // Category breakdown
        List<SystemAnalyticsDto.CategoryMetricDto> catMetrics = new ArrayList<>();
        for (Category cat : categoryRepository.findAllByActiveTrue()) {
            long count = allComplaints.stream()
                    .filter(c -> c.getCategory() != null && c.getCategory().getId().equals(cat.getId()))
                    .count();
            catMetrics.add(SystemAnalyticsDto.CategoryMetricDto.builder()
                    .categoryId(cat.getId())
                    .categoryName(cat.getName())
                    .departmentName(cat.getDepartment() != null ? cat.getDepartment().getName() : "")
                    .complaintCount(count)
                    .build());
        }

        return SystemAnalyticsDto.builder()
                .totalComplaints(total)
                .openComplaints(Math.max(0, total - resolved))
                .resolvedComplaints(resolved)
                .totalOverdue(totalOverdue)
                .overallSlaComplianceRate(complianceRate)
                .overallAverageRating(overallRating != null ? Math.round(overallRating * 10.0) / 10.0 : null)
                .totalCitizens(totalCitizens)
                .totalOfficers(totalOfficers)
                .totalDepartments(totalDepts)
                .departmentMetrics(deptMetrics)
                .categoryMetrics(catMetrics)
                .recentAuditLogs(auditLogService.getRecentLogs())
                .build();
    }
}
