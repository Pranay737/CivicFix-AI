package com.civicfix.service;

import com.civicfix.ai.EmbeddingClient;
import com.civicfix.ai.LlmClient;
import com.civicfix.ai.VectorUtils;
import com.civicfix.domain.*;
import com.civicfix.dto.ChatMessageDto;
import com.civicfix.dto.ChatRequestDto;
import com.civicfix.dto.ChatResponseDto;
import com.civicfix.dto.ChatSessionDto;
import com.civicfix.dto.ComplaintDto;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CivicAssistantRagService {

    private final LlmClient llmClient;
    private final EmbeddingClient embeddingClient;
    private final KnowledgeChunkRepository chunkRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern TRACKING_PATTERN = Pattern.compile("(?i)(CFX-\\d{8}-[A-Z0-9]{4})");

    @Transactional
    public ChatResponseDto chat(ChatRequestDto request, Long userId) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // 1. Resolve or Create Chat Session
        ChatSession session = resolveOrCreateSession(request.getSessionUuid(), user, request.getMessage());

        // 2. Check for Complaint Tracking query
        ComplaintDto relatedComplaint = null;
        String complaintContext = "";
        Matcher trackingMatcher = TRACKING_PATTERN.matcher(request.getMessage());
        if (trackingMatcher.find()) {
            String trackingNum = trackingMatcher.group(1).toUpperCase();
            Optional<Complaint> compOpt = complaintRepository.findByTrackingNumber(trackingNum);
            if (compOpt.isPresent()) {
                Complaint comp = compOpt.get();
                if (user != null && comp.getCitizen().getId().equals(user.getId())) {
                    relatedComplaint = ComplaintDto.fromEntity(comp);
                    complaintContext = String.format("""
                            [CITIZEN'S VERIFIED COMPLAINT RECORD]
                            Tracking Number: %s
                            Title: %s
                            Status: %s
                            Priority: %s
                            Department: %s
                            Submitted On: %s
                            SLA Due At: %s
                            Summary: %s
                            """,
                            comp.getTrackingNumber(), comp.getTitle(), comp.getStatus(), comp.getPriority(),
                            comp.getDepartment() != null ? comp.getDepartment().getName() : "General",
                            comp.getCreatedAt(), comp.getSlaDueAt(), comp.getAiSummary());
                } else if (user != null) {
                    complaintContext = "[SECURITY NOTICE]: Complaint #" + trackingNum +
                            " exists but belongs to another citizen. For privacy, you cannot disclose details.";
                }
            }
        }

        // 3. Retrieve Top-K Semantically Similar Chunks
        List<Float> queryEmbedding = embeddingClient.generateEmbedding(request.getMessage());
        List<KnowledgeChunk> allChunks = chunkRepository.findAllActiveChunks();

        record ChunkScore(KnowledgeChunk chunk, double score) {}
        List<ChunkScore> scoredChunks = new ArrayList<>();

        for (KnowledgeChunk chunk : allChunks) {
            List<Float> chunkVec = VectorUtils.parseVector(chunk.getEmbedding());
            if (!chunkVec.isEmpty()) {
                double sim = VectorUtils.cosineSimilarity(queryEmbedding, chunkVec);
                if (sim >= 0.25) { // Similarity threshold
                    scoredChunks.add(new ChunkScore(chunk, sim));
                }
            }
        }

        scoredChunks.sort((a, b) -> Double.compare(b.score(), a.score()));
        List<ChunkScore> topK = scoredChunks.stream().limit(4).toList();

        // 4. Assemble Grounded Context and Collect Citations
        StringBuilder contextBuilder = new StringBuilder();
        Set<String> citations = new LinkedHashSet<>();

        for (ChunkScore cs : topK) {
            KnowledgeDocument doc = cs.chunk().getDocument();
            citations.add(doc.getTitle());
            contextBuilder.append(String.format("""
                    --- SOURCE DOCUMENT: %s (Category: %s) ---
                    %s
                    
                    """, doc.getTitle(), doc.getCategory(), cs.chunk().getChunkText()));
        }

        if (!complaintContext.isBlank()) {
            contextBuilder.append("\n").append(complaintContext).append("\n");
        }

        // 5. Construct Guardrailed System and User Prompts
        String systemInstruction = """
                You are CivicFix AI, an intelligent, empathetic civic assistance officer.
                Rules:
                1. Answer the citizen's inquiry truthfully and concisely using ONLY the provided official source documents and complaint records.
                2. If the provided knowledge base does NOT contain sufficient information to answer the question, politely say:
                   "I apologize, but this information is not covered in our current civic policies. I recommend filing a formal issue report via the CivicFix portal or reaching out to municipal customer support."
                3. If checking a complaint, give clear status updates based on the verified complaint record.
                4. Do NOT make up laws, phone numbers, or deadlines that are not in the provided documents.
                5. Maintain a professional, encouraging, and supportive municipal tone.
                """;

        String prompt = String.format("""
                [OFFICIAL MUNICIPAL KNOWLEDGE BASE CONTEXT]
                %s

                [CITIZEN QUESTION]
                %s
                """,
                contextBuilder.length() > 0 ? contextBuilder.toString() : "No matching knowledge base documents found.",
                request.getMessage());

        String aiResponseText = llmClient.generateText(prompt, systemInstruction);

        // Fallback cleanup if response looks like JSON from rule-engine
        if (aiResponseText.startsWith("{") && aiResponseText.contains("\"summary\":")) {
            try {
                var jsonNode = objectMapper.readTree(aiResponseText);
                if (jsonNode.has("summary")) {
                    aiResponseText = jsonNode.get("summary").asText();
                }
            } catch (Exception ignored) {}
        }

        List<String> citationList = new ArrayList<>(citations);

        // 6. Persist Messages
        String citationsJson = null;
        try {
            citationsJson = objectMapper.writeValueAsString(citationList);
        } catch (JsonProcessingException ignored) {}

        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .sender("USER")
                .message(request.getMessage())
                .build();
        messageRepository.save(userMsg);

        ChatMessage botMsg = ChatMessage.builder()
                .session(session)
                .sender("ASSISTANT")
                .message(aiResponseText)
                .citationsJson(citationsJson)
                .build();
        messageRepository.save(botMsg);

        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return ChatResponseDto.builder()
                .sessionUuid(session.getSessionUuid())
                .response(aiResponseText)
                .citations(citationList)
                .relatedComplaint(relatedComplaint)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(ChatSessionDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getSessionMessages(String sessionUuid, Long userId) {
        ChatSession session = sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found"));

        if (userId != null && session.getUser() != null && !session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Chat session not found for this user");
        }

        return messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
                .map(msg -> ChatMessageDto.fromEntity(msg, objectMapper))
                .toList();
    }

    @Transactional
    public void deleteSession(String sessionUuid, Long userId) {
        sessionRepository.findBySessionUuid(sessionUuid).ifPresent(session -> {
            if (userId == null || session.getUser() == null || session.getUser().getId().equals(userId)) {
                sessionRepository.delete(session);
            }
        });
    }

    private ChatSession resolveOrCreateSession(String sessionUuid, User user, String initialMessage) {
        if (sessionUuid != null && !sessionUuid.isBlank()) {
            Optional<ChatSession> existing = sessionRepository.findBySessionUuid(sessionUuid);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        String title = initialMessage.length() > 40 ? initialMessage.substring(0, 37) + "..." : initialMessage;
        ChatSession newSession = ChatSession.builder()
                .sessionUuid(UUID.randomUUID().toString())
                .user(user)
                .title(title)
                .build();
        return sessionRepository.save(newSession);
    }
}
