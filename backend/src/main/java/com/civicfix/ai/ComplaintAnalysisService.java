package com.civicfix.ai;

import com.civicfix.domain.*;
import com.civicfix.dto.ComplaintDto;
import com.civicfix.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintAnalysisService {

    private final LlmClient llmClient;
    private final EmbeddingClient embeddingClient;
    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.rules.duplicate-radius-meters:200.0}")
    private double duplicateRadiusMeters;

    @Value("${app.ai.rules.duplicate-similarity-threshold:0.80}")
    private double duplicateSimilarityThreshold;

    @Value("${app.ai.rules.duplicate-lookback-days:30}")
    private int duplicateLookbackDays;

    public AiTriageResult previewTriage(String title, String description, String address) {
        return performTriage(title, description, address);
    }

    @Transactional
    public void analyzeAndEnrichSync(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
        if (complaint == null) return;

        try {
            // 1. AI Triage
            AiTriageResult triage = performTriage(complaint.getTitle(), complaint.getDescription(), complaint.getAddress());

            complaint.setAiCategorySuggestion(triage.getCategory());
            complaint.setAiDepartmentSuggestion(triage.getDepartment());
            complaint.setAiPrioritySuggestion(triage.getPriority().name());
            complaint.setAiConfidence(triage.getConfidence());
            complaint.setAiReasoning(triage.getReasoning());
            complaint.setAiSummary(triage.getSummary());

            // Map Category if not selected by citizen
            if (complaint.getCategory() == null) {
                categoryRepository.findByNameIgnoreCase(triage.getCategory())
                        .ifPresent(complaint::setCategory);
            }

            // Map Department
            if (complaint.getDepartment() == null) {
                if (complaint.getCategory() != null && complaint.getCategory().getDepartment() != null) {
                    complaint.setDepartment(complaint.getCategory().getDepartment());
                } else {
                    departmentRepository.findByNameIgnoreCase(triage.getDepartment())
                            .ifPresent(complaint::setDepartment);
                }
            }

            // Assign Priority (combining AI & Rules)
            complaint.setPriority(triage.getPriority());

            // 2. Compute Embedding Vector
            String textToEmbed = complaint.getTitle() + "\n" + complaint.getDescription();
            List<Float> embedding = embeddingClient.generateEmbedding(textToEmbed);
            complaint.setEmbedding(VectorUtils.serializeVector(embedding));

            // 3. Duplicate Detection
            detectDuplicates(complaint, embedding);

            // 4. Update status to REGISTERED
            if (complaint.getStatus() == ComplaintStatus.SUBMITTED) {
                complaint.setStatus(ComplaintStatus.REGISTERED);
            }

            // Recalculate SLA due date
            if (complaint.getCategory() != null) {
                LocalDateTime due = slaPolicyRepository.findByCategoryIdAndPriority(complaint.getCategory().getId(), complaint.getPriority())
                        .map(policy -> LocalDateTime.now().plusHours(policy.getResolutionHours()))
                        .orElseGet(() -> LocalDateTime.now().plusHours(48));
                complaint.setSlaDueAt(due);
            }

            complaintRepository.save(complaint);

            // Record status history for AI Triage
            String triageComment = String.format("AI Triage completed: Suggested category '%s', priority '%s', routed to '%s'. Summary: %s",
                    triage.getCategory(), triage.getPriority(),
                    complaint.getDepartment() != null ? complaint.getDepartment().getName() : "General",
                    triage.getSummary());

            ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                    .complaint(complaint)
                    .previousStatus(ComplaintStatus.SUBMITTED)
                    .newStatus(ComplaintStatus.REGISTERED)
                    .changedBy(complaint.getCitizen())
                    .comment(triageComment)
                    .build();
            statusHistoryRepository.save(history);

            log.info("AI Analysis completed successfully for complaint #{}: Category={}, Priority={}",
                    complaint.getTrackingNumber(), triage.getCategory(), triage.getPriority());

        } catch (Exception e) {
            log.error("Failed to run AI triage on complaint #{}: {}", complaint.getId(), e.getMessage(), e);
        }
    }

    private AiTriageResult performTriage(String title, String description, String address) {
        String systemInstruction = """
                You are CivicFix AI, an expert municipal triage intelligence system.
                Analyze the civic issue report and output ONLY a JSON object with this exact schema:
                {
                  "category": "one of: Pothole / Road Damage, Uncollected Garbage / Dump, Broken Streetlight / Blackout, Water Leakage / Pipe Burst, Drainage Overflow / Clogged Drain, Damaged Public Property, Other Civic Issue",
                  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
                  "department": "one of: Roads & Infrastructure, Sanitation & Waste Management, Electricity & Streetlights, Water Supply & Pipelines, Drainage & Sewage, General Civic Affairs",
                  "summary": "1-2 concise sentences summarizing the issue for field officers",
                  "confidence": float between 0.0 and 1.0,
                  "reasoning": "brief explanation for priority and department selection"
                }
                """;

        String prompt = String.format("Title: %s\nDescription: %s\nLocation Address: %s",
                title, description, address != null ? address : "Not provided");

        String rawResponse = llmClient.generateText(prompt, systemInstruction);
        return parseAndEnforceRules(rawResponse, title, description);
    }

    private AiTriageResult parseAndEnforceRules(String rawJson, String title, String description) {
        AiTriageResult result = null;
        try {
            String json = rawJson.trim();
            if (json.startsWith("```json")) {
                json = json.substring(7);
            }
            if (json.startsWith("```")) {
                json = json.substring(3);
            }
            if (json.endsWith("```")) {
                json = json.substring(0, json.length() - 3);
            }
            json = json.trim();

            JsonNode node = objectMapper.readTree(json);
            String cat = node.path("category").asText("Other Civic Issue");
            String priStr = node.path("priority").asText("MEDIUM").toUpperCase(Locale.ROOT);
            String dept = node.path("department").asText("General Civic Affairs");
            String summary = node.path("summary").asText(title);
            double confidence = node.path("confidence").asDouble(0.85);
            String reasoning = node.path("reasoning").asText("Automated municipal triage assessment.");

            Priority priority = Priority.MEDIUM;
            try {
                priority = Priority.valueOf(priStr);
            } catch (IllegalArgumentException ignored) {}

            result = AiTriageResult.builder()
                    .category(cat)
                    .priority(priority)
                    .department(dept)
                    .summary(summary)
                    .confidence(confidence)
                    .reasoning(reasoning)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to parse LLM JSON: {}. Applying fallback.", e.getMessage());
        }

        if (result == null) {
            result = AiTriageResult.builder()
                    .category("Other Civic Issue")
                    .priority(Priority.MEDIUM)
                    .department("General Civic Affairs")
                    .summary(title)
                    .confidence(0.70)
                    .reasoning("Fallback triage rules applied.")
                    .build();
        }

        // Apply Priority Safety Rules Enhancement
        String combinedText = (title + " " + description).toLowerCase();

        boolean hasSafetyHazard = combinedText.contains("spark") || combinedText.contains("live wire") ||
                combinedText.contains("open manhole") || combinedText.contains("flood") ||
                combinedText.contains("gas leak") || combinedText.contains("collapse") ||
                combinedText.contains("electrocution");

        boolean hasSensitiveLocation = combinedText.contains("school") || combinedText.contains("hospital") ||
                combinedText.contains("kindergarten") || combinedText.contains("daycare") ||
                combinedText.contains("nursing home");

        if (hasSafetyHazard) {
            result.setPriority(Priority.CRITICAL);
            result.setReasoning(result.getReasoning() + " [Rule Boost: Immediate hazard identified -> CRITICAL]");
        } else if (hasSensitiveLocation && result.getPriority() == Priority.LOW) {
            result.setPriority(Priority.HIGH);
            result.setReasoning(result.getReasoning() + " [Rule Boost: Proximity to vulnerable institution -> HIGH]");
        }

        return result;
    }

    private void detectDuplicates(Complaint complaint, List<Float> embedding) {
        if (complaint.getCategory() == null || complaint.getLatitude() == null || complaint.getLongitude() == null) {
            return;
        }

        LocalDateTime since = LocalDateTime.now().minusDays(duplicateLookbackDays);
        List<Complaint> candidates = complaintRepository.findCandidatesForDuplicate(
                complaint.getCategory().getId(),
                since,
                complaint.getId()
        );

        Complaint highestMatch = null;
        double maxSimilarity = 0.0;

        for (Complaint candidate : candidates) {
            if (candidate.getLatitude() == null || candidate.getLongitude() == null) continue;

            double distanceMeters = VectorUtils.haversineDistanceMeters(
                    complaint.getLatitude(), complaint.getLongitude(),
                    candidate.getLatitude(), candidate.getLongitude()
            );

            if (distanceMeters <= duplicateRadiusMeters) {
                // Within 200m radius! Now compare vector similarity
                List<Float> candidateEmbedding = VectorUtils.parseVector(candidate.getEmbedding());
                if (!candidateEmbedding.isEmpty()) {
                    double similarity = VectorUtils.cosineSimilarity(embedding, candidateEmbedding);
                    if (similarity >= duplicateSimilarityThreshold && similarity > maxSimilarity) {
                        maxSimilarity = similarity;
                        highestMatch = candidate;
                    }
                }
            }
        }

        if (highestMatch != null) {
            log.info("Potential duplicate detected! Complaint #{} matches original #{} with similarity {:.2f}",
                    complaint.getTrackingNumber(), highestMatch.getTrackingNumber(), maxSimilarity);
            complaint.setDuplicate(true);
            complaint.setDuplicateOf(highestMatch);
            complaint.setSimilarityScore(Math.round(maxSimilarity * 100.0) / 100.0);
        }
    }
}
