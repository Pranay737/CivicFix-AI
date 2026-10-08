package com.civicfix;

import com.civicfix.domain.*;
import com.civicfix.dto.*;
import com.civicfix.exception.BadRequestException;
import com.civicfix.repository.*;
import com.civicfix.service.ComplaintService;
import com.civicfix.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ComplaintWorkflowTests {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private User citizen;
    private User officer;
    private User deptAdmin;
    private Category potholeCategory;

    @BeforeEach
    void setUp() {
        citizen = userRepository.findByEmail("citizen.jane@civicfix.ai").orElseThrow();
        officer = userRepository.findByEmail("officer.smith@civicfix.ai").orElseThrow();
        deptAdmin = userRepository.findByEmail("roads.admin@civicfix.ai").orElseThrow();
        potholeCategory = categoryRepository.findByNameIgnoreCase("Pothole / Road Damage").orElseThrow();
    }

    @Test
    @DisplayName("End-to-End Complaint Lifecycle: Submit -> Assign -> In Progress -> Resolve -> Reopen -> Resolve -> Verify & Close")
    void testCompleteComplaintWorkflow() {
        // 1. Submit Complaint
        CreateComplaintRequest createReq = CreateComplaintRequest.builder()
                .title("Severe pothole on Elm St")
                .description("Deep pothole damaging car tires near the Elm Street school crossing")
                .categoryId(potholeCategory.getId())
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("123 Elm Street")
                .imageUrls(List.of("/uploads/complaints/test-pothole.jpg"))
                .build();

        ComplaintDto submitted = complaintService.createComplaint(createReq, citizen.getId());
        assertNotNull(submitted.getId());
        assertTrue(submitted.getTrackingNumber().startsWith("CFX-"));
        assertEquals(ComplaintStatus.REGISTERED, submitted.getStatus());
        assertEquals(1, submitted.getImages().size());
        assertEquals(2, submitted.getTimeline().size()); // 1: SUBMITTED, 2: REGISTERED (AI Triage)

        // 2. Assign to Officer by Department Admin
        AssignOfficerRequest assignReq = AssignOfficerRequest.builder()
                .officerId(officer.getId())
                .notes("Please inspect urgent school route")
                .build();

        ComplaintDto assigned = complaintService.assignOfficer(submitted.getId(), assignReq, deptAdmin.getId());
        assertEquals(ComplaintStatus.ASSIGNED, assigned.getStatus());
        assertEquals(3, assigned.getTimeline().size());

        // 3. Officer marks as IN_PROGRESS
        UpdateStatusRequest inProgressReq = UpdateStatusRequest.builder()
                .status(ComplaintStatus.IN_PROGRESS)
                .comment("Asphalt crew dispatched to site")
                .build();

        ComplaintDto inProgress = complaintService.updateStatus(assigned.getId(), inProgressReq, officer.getId());
        assertEquals(ComplaintStatus.IN_PROGRESS, inProgress.getStatus());
        assertEquals(4, inProgress.getTimeline().size());

        // 4. Officer Resolves Complaint with evidence
        ResolveComplaintRequest resolveReq = ResolveComplaintRequest.builder()
                .notes("Filled with hot-mix asphalt and rolled flat")
                .evidenceImageUrls(List.of("/uploads/resolutions/repaired.jpg"))
                .build();

        ComplaintDto resolved = complaintService.resolveComplaint(inProgress.getId(), resolveReq, officer.getId());
        assertEquals(ComplaintStatus.RESOLVED, resolved.getStatus());
        assertNotNull(resolved.getResolution());
        assertEquals("Filled with hot-mix asphalt and rolled flat", resolved.getResolution().getNotes());

        // 5. Citizen Rejects Resolution -> REOPENED
        VerifyComplaintRequest reopenReq = VerifyComplaintRequest.builder()
                .verified(false)
                .comment("Edges are still uneven and loose stones remain")
                .build();

        ComplaintDto reopened = complaintService.verifyResolution(resolved.getId(), reopenReq, citizen.getId());
        assertEquals(ComplaintStatus.REOPENED, reopened.getStatus());

        // 6. Officer finishes touch-up and re-resolves
        ResolveComplaintRequest resolveAgainReq = ResolveComplaintRequest.builder()
                .notes("Re-rolled and sealed edges with bitumen emulsion")
                .evidenceImageUrls(List.of("/uploads/resolutions/fixed-final.jpg"))
                .build();

        ComplaintDto resolvedAgain = complaintService.resolveComplaint(reopened.getId(), resolveAgainReq, officer.getId());
        assertEquals(ComplaintStatus.RESOLVED, resolvedAgain.getStatus());

        // 7. Citizen Accepts Resolution and gives 5-star rating -> CLOSED
        VerifyComplaintRequest closeReq = VerifyComplaintRequest.builder()
                .verified(true)
                .comment("Looks great now! Thank you for the quick follow up.")
                .rating(5)
                .build();

        ComplaintDto closed = complaintService.verifyResolution(resolvedAgain.getId(), closeReq, citizen.getId());
        assertEquals(ComplaintStatus.CLOSED, closed.getStatus());
        assertNotNull(closed.getFeedback());
        assertEquals(5, closed.getFeedback().getRating());
    }

    @Test
    @DisplayName("Invalid status transitions are prevented server-side")
    void testInvalidStatusTransition() {
        CreateComplaintRequest createReq = CreateComplaintRequest.builder()
                .title("Street light test")
                .description("Light is off")
                .categoryId(potholeCategory.getId())
                .build();

        ComplaintDto submitted = complaintService.createComplaint(createReq, citizen.getId());

        // SUBMITTED directly to RESOLVED without assignment should fail
        UpdateStatusRequest invalidReq = UpdateStatusRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .comment("Trying to skip steps")
                .build();

        assertThrows(BadRequestException.class, () ->
                complaintService.updateStatus(submitted.getId(), invalidReq, officer.getId())
        );
    }

    @Test
    @DisplayName("Local file storage validation rejects invalid files")
    void testFileStorageValidation() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.txt", "text/plain", new byte[0]);
        assertThrows(BadRequestException.class, () -> fileStorageService.validateFile(emptyFile));

        MockMultipartFile badType = new MockMultipartFile("file", "test.exe", "application/x-msdownload", "fake binary".getBytes());
        assertThrows(BadRequestException.class, () -> fileStorageService.validateFile(badType));

        MockMultipartFile validImage = new MockMultipartFile("file", "pothole.jpg", "image/jpeg", "image content".getBytes());
        assertDoesNotThrow(() -> fileStorageService.validateFile(validImage));
    }
}
