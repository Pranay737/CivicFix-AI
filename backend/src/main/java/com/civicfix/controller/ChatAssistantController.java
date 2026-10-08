package com.civicfix.controller;

import com.civicfix.dto.ChatMessageDto;
import com.civicfix.dto.ChatRequestDto;
import com.civicfix.dto.ChatResponseDto;
import com.civicfix.dto.ChatSessionDto;
import com.civicfix.security.SecurityUtils;
import com.civicfix.service.CivicAssistantRagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
@Tag(name = "AI Civic Assistant", description = "Endpoints for RAG-powered civic assistant conversations with source citations")
public class ChatAssistantController {

    private final CivicAssistantRagService ragService;

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ask question to AI Civic Assistant (RAG query with citations and complaint status check)")
    public ResponseEntity<ChatResponseDto> chat(@Valid @RequestBody ChatRequestDto request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ragService.chat(request, userId));
    }

    @GetMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's previous chat sessions")
    public ResponseEntity<List<ChatSessionDto>> getUserSessions() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ragService.getUserSessions(userId));
    }

    @GetMapping("/sessions/{sessionUuid}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get chat history for a session")
    public ResponseEntity<List<ChatMessageDto>> getSessionMessages(@PathVariable String sessionUuid) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ragService.getSessionMessages(sessionUuid, userId));
    }

    @DeleteMapping("/sessions/{sessionUuid}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete chat session")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionUuid) {
        Long userId = SecurityUtils.getCurrentUserId();
        ragService.deleteSession(sessionUuid, userId);
        return ResponseEntity.noContent().build();
    }
}
