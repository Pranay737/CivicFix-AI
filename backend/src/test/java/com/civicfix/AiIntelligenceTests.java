package com.civicfix;

import com.civicfix.ai.AiTriageResult;
import com.civicfix.ai.ComplaintAnalysisService;
import com.civicfix.ai.VectorUtils;
import com.civicfix.domain.Complaint;
import com.civicfix.domain.Priority;
import com.civicfix.dto.ComplaintDto;
import com.civicfix.dto.CreateComplaintRequest;
import com.civicfix.repository.CategoryRepository;
import com.civicfix.repository.UserRepository;
import com.civicfix.service.ComplaintService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AiIntelligenceTests {

    @Autowired
    private ComplaintAnalysisService analysisService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("AI Triage categorizes issues correctly with keyword fallback")
    void testAiTriageCategorization() {
        // Pothole test
        AiTriageResult roadResult = analysisService.previewTriage(
                "Deep crater on highway",
                "Damaged asphalt and dangerous pothole near the highway entrance",
                "Highway Exit 4"
        );
        assertEquals("Pothole / Road Damage", roadResult.getCategory());
        assertEquals("Roads & Infrastructure", roadResult.getDepartment());
        assertNotNull(roadResult.getSummary());

        // Garbage test
        AiTriageResult trashResult = analysisService.previewTriage(
                "Overflowing dumpster on 5th Ave",
                "Large pile of uncollected garbage rotting by the curbside",
                "5th Avenue"
        );
        assertEquals("Uncollected Garbage / Dump", trashResult.getCategory());
        assertEquals("Sanitation & Waste Management", trashResult.getDepartment());

        // Streetlight blackout
        AiTriageResult lightResult = analysisService.previewTriage(
                "Dark street corner",
                "Broken streetlight fixture not turning on after dusk",
                "Pine Street"
        );
        assertEquals("Broken Streetlight / Blackout", lightResult.getCategory());
        assertEquals("Electricity & Streetlights", lightResult.getDepartment());
    }

    @Test
    @DisplayName("AI Priority Rules boost safety hazards to CRITICAL")
    void testAiPrioritySafetyBoost() {
        AiTriageResult hazardResult = analysisService.previewTriage(
                "Sparking power cable",
                "Live wire fallen on sidewalk near school entrance posing electrocution risk",
                "Lincoln Elementary"
        );
        assertEquals(Priority.CRITICAL, hazardResult.getPriority(), "Safety hazards must be CRITICAL");
        assertTrue(hazardResult.getReasoning().contains("hazard") || hazardResult.getReasoning().contains("CRITICAL"));
    }

    @Test
    @DisplayName("Vector Haversine & Cosine Similarity Duplicate Detection works accurately")
    void testDuplicateDetectionFlow() {
        Long citizenId = userRepository.findByEmail("citizen.jane@civicfix.ai").orElseThrow().getId();
        Long potholeCatId = categoryRepository.findByNameIgnoreCase("Pothole / Road Damage").orElseThrow().getId();

        // 1. First complaint reported at coordinates (37.774900, -122.419400)
        CreateComplaintRequest firstReq = CreateComplaintRequest.builder()
                .title("Huge dangerous pothole on Market St")
                .description("Deep hole in road near Market St and 4th St causing severe tire blowouts")
                .categoryId(potholeCatId)
                .latitude(37.774900)
                .longitude(-122.419400)
                .address("Market & 4th St")
                .build();

        ComplaintDto original = complaintService.createComplaint(firstReq, citizenId);
        assertNotNull(original.getId());
        assertFalse(original.isDuplicate(), "First complaint should not be marked as duplicate");

        // 2. Second complaint reported 25 meters away with very similar description
        // Coordinates slightly offset: (37.775050, -122.419480) ~ 18 meters
        CreateComplaintRequest secondReq = CreateComplaintRequest.builder()
                .title("Deep pothole in Market Street")
                .description("Dangerous road hole on Market St and 4th causing damage to vehicles")
                .categoryId(potholeCatId)
                .latitude(37.775050)
                .longitude(-122.419480)
                .address("Market St near 4th")
                .build();

        ComplaintDto duplicate = complaintService.createComplaint(secondReq, citizenId);
        assertNotNull(duplicate.getId());
        assertTrue(duplicate.isDuplicate(), "Second complaint within 25m with similar content must be detected as duplicate");
        assertEquals(original.getId(), duplicate.getDuplicateOfId(), "Must link to the original complaint ID");
        assertNotNull(duplicate.getSimilarityScore());
        assertTrue(duplicate.getSimilarityScore() >= 0.80, "Similarity score must exceed 0.80 threshold");

        // 3. Third complaint reported far away (> 50 km) at (38.5816, -121.4944)
        CreateComplaintRequest thirdReq = CreateComplaintRequest.builder()
                .title("Huge dangerous pothole on Market St")
                .description("Deep hole in road near Market St causing severe tire blowouts")
                .categoryId(potholeCatId)
                .latitude(38.581600)
                .longitude(-121.494400)
                .address("Sacramento downtown")
                .build();

        ComplaintDto nonDuplicate = complaintService.createComplaint(thirdReq, citizenId);
        assertFalse(nonDuplicate.isDuplicate(), "Complaint far away must not be marked as duplicate despite similar text");
    }

    @Test
    @DisplayName("VectorUtils Haversine formula calculates accurate distances")
    void testHaversineDistance() {
        // Distance between two points ~ 111 meters (0.001 deg latitude ~ 111m)
        double distance = VectorUtils.haversineDistanceMeters(37.7749, -122.4194, 37.7759, -122.4194);
        assertTrue(distance > 105 && distance < 118, "Distance should be approx 111 meters");
    }
}
