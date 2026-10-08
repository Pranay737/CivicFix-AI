package com.civicfix;

import com.civicfix.domain.User;
import com.civicfix.dto.*;
import com.civicfix.repository.CategoryRepository;
import com.civicfix.repository.UserRepository;
import com.civicfix.service.CivicAssistantRagService;
import com.civicfix.service.ComplaintService;
import com.civicfix.service.KnowledgeBaseService;
import org.junit.jupiter.api.BeforeEach;
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
class RagAssistantTests {

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @Autowired
    private CivicAssistantRagService ragService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User citizen;

    @BeforeEach
    void setUp() {
        citizen = userRepository.findByEmail("citizen.jane@civicfix.ai").orElseThrow();
        knowledgeBaseService.reindexAll();
    }

    @Test
    @DisplayName("RAG Assistant answers civic queries with document citations")
    void testRagQueryWithCitations() {
        ChatRequestDto req = ChatRequestDto.builder()
                .message("What are the guidelines and turnaround time for hazardous pothole repair?")
                .build();

        ChatResponseDto res = ragService.chat(req, citizen.getId());

        assertNotNull(res.getResponse());
        assertNotNull(res.getSessionUuid());
        assertFalse(res.getCitations().isEmpty(), "Response must include citations");
        assertTrue(res.getCitations().contains("Pothole & Road Repair Operating Procedures") ||
                   res.getCitations().contains("Civic Issue Reporting Guidelines"),
                   "Citations should match relevant civic manuals");

        // Verify session persistence
        List<ChatSessionDto> sessions = ragService.getUserSessions(citizen.getId());
        assertFalse(sessions.isEmpty());

        List<ChatMessageDto> messages = ragService.getSessionMessages(res.getSessionUuid(), citizen.getId());
        assertEquals(2, messages.size()); // 1 user + 1 assistant
        assertEquals("USER", messages.get(0).getSender());
        assertEquals("ASSISTANT", messages.get(1).getSender());
    }

    @Test
    @DisplayName("RAG Assistant looks up citizen complaint status when tracking number is mentioned")
    void testComplaintStatusLookupInChat() {
        Long potholeCatId = categoryRepository.findByNameIgnoreCase("Pothole / Road Damage").orElseThrow().getId();

        // Citizen creates a complaint
        CreateComplaintRequest createReq = CreateComplaintRequest.builder()
                .title("Broken curb on 10th street")
                .description("Concrete curb collapsed near parking zone")
                .categoryId(potholeCatId)
                .build();

        ComplaintDto comp = complaintService.createComplaint(createReq, citizen.getId());

        // Ask assistant about this specific tracking number
        ChatRequestDto chatReq = ChatRequestDto.builder()
                .message("Can you please check the status of my complaint " + comp.getTrackingNumber() + "?")
                .build();

        ChatResponseDto chatRes = ragService.chat(chatReq, citizen.getId());
        assertNotNull(chatRes.getRelatedComplaint());
        assertEquals(comp.getTrackingNumber(), chatRes.getRelatedComplaint().getTrackingNumber());
    }

    @Test
    @DisplayName("Knowledge Base CRUD creates chunks and re-indexes properly")
    void testKnowledgeBaseCrud() {
        CreateKnowledgeDocumentRequest docReq = CreateKnowledgeDocumentRequest.builder()
                .title("Municipal Tree Trimming Policy")
                .source("Department of Urban Forestry")
                .category("Environment")
                .content("Urban forestry trims trees interfering with utility lines during autumn months. Trees on private property remain the homeowner's responsibility unless hanging over public sidewalks.")
                .active(true)
                .build();

        KnowledgeDocumentDto doc = knowledgeBaseService.createDocument(docReq);
        assertNotNull(doc.getId());
        assertTrue(doc.getChunkCount() > 0, "Document must be chunked and indexed");

        // Test querying the newly indexed document
        ChatRequestDto chatReq = ChatRequestDto.builder()
                .message("Who is responsible for trimming trees hanging over public sidewalks?")
                .build();

        ChatResponseDto chatRes = ragService.chat(chatReq, citizen.getId());
        assertTrue(chatRes.getCitations().contains("Municipal Tree Trimming Policy"),
                "New document should be cited in relevant answer");
    }
}
