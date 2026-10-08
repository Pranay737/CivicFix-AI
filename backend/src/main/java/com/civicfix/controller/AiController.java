package com.civicfix.controller;

import com.civicfix.ai.AiTriageResult;
import com.civicfix.ai.ComplaintAnalysisService;
import com.civicfix.dto.CreateComplaintRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Intelligence", description = "Endpoints for AI-powered civic issue triage and duplicate previews")
public class AiController {

    private final ComplaintAnalysisService analysisService;

    @PostMapping("/analyze-preview")
    @Operation(summary = "Real-time AI triage preview for citizen/admin before submitting")
    public ResponseEntity<AiTriageResult> previewTriage(@RequestBody CreateComplaintRequest request) {
        AiTriageResult result = analysisService.previewTriage(
                request.getTitle(),
                request.getDescription(),
                request.getAddress()
        );
        return ResponseEntity.ok(result);
    }
}
