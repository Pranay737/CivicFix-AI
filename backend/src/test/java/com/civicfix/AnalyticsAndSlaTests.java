package com.civicfix;

import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import com.civicfix.dto.*;
import com.civicfix.repository.CategoryRepository;
import com.civicfix.repository.DepartmentRepository;
import com.civicfix.repository.UserRepository;
import com.civicfix.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AnalyticsAndSlaTests {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SlaPolicyService slaPolicyService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User citizen;
    private User officer;
    private User roadsAdmin;

    @BeforeEach
    void setUp() {
        citizen = userRepository.findByEmail("citizen.jane@civicfix.ai").orElseThrow();
        officer = userRepository.findByEmail("officer.smith@civicfix.ai").orElseThrow();
        roadsAdmin = userRepository.findByEmail("roads.admin@civicfix.ai").orElseThrow();
    }

    @Test
    @DisplayName("Notification Service creates, counts, and marks notifications as read")
    void testNotifications() {
        notificationService.createNotification(
                citizen,
                "Test Alert",
                "Your pothole issue has an update",
                "STATUS_UPDATE",
                "/complaints/1"
        );

        long unread = notificationService.getUnreadCount(citizen.getId());
        assertTrue(unread >= 1);

        Page<NotificationDto> page = notificationService.getUserNotifications(citizen.getId(), PageRequest.of(0, 10));
        assertFalse(page.isEmpty());

        NotificationDto first = page.getContent().get(0);
        assertFalse(first.isRead());

        // Mark single read
        notificationService.markAsRead(first.getId(), citizen.getId());
        long afterRead = notificationService.getUnreadCount(citizen.getId());
        assertEquals(unread - 1, afterRead);

        // Mark all read
        notificationService.markAllAsRead(citizen.getId());
        assertEquals(0, notificationService.getUnreadCount(citizen.getId()));
    }

    @Test
    @DisplayName("Department and System Analytics aggregate metrics and SLA performance correctly")
    void testAnalytics() {
        Long roadsDeptId = departmentRepository.findByCode("ROADS").orElseThrow().getId();
        Long potholeCatId = categoryRepository.findByNameIgnoreCase("Pothole / Road Damage").orElseThrow().getId();

        // Submit and resolve a complaint in Roads department
        ComplaintDto comp = complaintService.createComplaint(
                CreateComplaintRequest.builder()
                        .title("Caved road section")
                        .description("Asphalt depression in turning lane")
                        .categoryId(potholeCatId)
                        .build(),
                citizen.getId()
        );

        complaintService.assignOfficer(comp.getId(), AssignOfficerRequest.builder().officerId(officer.getId()).build(), roadsAdmin.getId());
        complaintService.updateStatus(comp.getId(), UpdateStatusRequest.builder().status(com.civicfix.domain.ComplaintStatus.IN_PROGRESS).build(), officer.getId());
        complaintService.resolveComplaint(comp.getId(), ResolveComplaintRequest.builder().notes("Repaired").build(), officer.getId());

        // Test Department Analytics
        DepartmentAnalyticsDto deptStats = analyticsService.getDepartmentAnalytics(roadsDeptId);
        assertNotNull(deptStats);
        assertTrue(deptStats.getTotalComplaints() >= 1);
        assertTrue(deptStats.getResolvedComplaints() >= 1);
        assertTrue(deptStats.getSlaComplianceRate() >= 0.0);
        assertFalse(deptStats.getOfficerWorkload().isEmpty(), "Officer workload list should be populated");

        // Test System Analytics
        SystemAnalyticsDto sysStats = analyticsService.getSystemAnalytics();
        assertNotNull(sysStats);
        assertTrue(sysStats.getTotalComplaints() >= 1);
        assertTrue(sysStats.getTotalCitizens() >= 1);
        assertTrue(sysStats.getTotalOfficers() >= 1);
        assertFalse(sysStats.getDepartmentMetrics().isEmpty());
    }

    @Test
    @DisplayName("SLA Policies can be listed and updated")
    void testSlaPolicies() {
        List<SlaPolicyDto> policies = slaPolicyService.getAllPolicies();
        assertFalse(policies.isEmpty(), "Seeded SLA policies should exist");

        SlaPolicyDto first = policies.get(0);
        int originalHours = first.getResolutionHours();

        SlaPolicyDto updated = slaPolicyService.updatePolicy(first.getId(), originalHours + 12);
        assertEquals(originalHours + 12, updated.getResolutionHours());
    }

    @Test
    @DisplayName("Audit Log Service records and retrieves administrative actions")
    void testAuditLogs() {
        auditLogService.logAction(
                roadsAdmin.getId(),
                "REASSIGN_OFFICER",
                "COMPLAINT",
                "CFX-TEST-001",
                "Reassigned from Officer A to Officer B",
                "127.0.0.1"
        );

        List<AuditLogDto> recent = auditLogService.getRecentLogs();
        assertFalse(recent.isEmpty());
        assertEquals("REASSIGN_OFFICER", recent.get(0).getAction());
    }
}
