package com.civicfix.controller;

import com.civicfix.dto.CreateKnowledgeDocumentRequest;
import com.civicfix.dto.KnowledgeDocumentDto;
import com.civicfix.service.KnowledgeBaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kb")
@RequiredArgsConstructor
@Tag(name = "Knowledge Base", description = "Endpoints for administering civic knowledge documents for RAG retrieval")
public class KnowledgeDocumentController {

    private final KnowledgeBaseService knowledgeBaseService;

    @PostMapping("/documents")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Add new civic knowledge document and index for RAG (System Admin only)")
    public ResponseEntity<KnowledgeDocumentDto> createDocument(@Valid @RequestBody CreateKnowledgeDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(knowledgeBaseService.createDocument(request));
    }

    @PutMapping("/documents/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Update knowledge document and re-index chunks (System Admin only)")
    public ResponseEntity<KnowledgeDocumentDto> updateDocument(@PathVariable Long id, @Valid @RequestBody CreateKnowledgeDocumentRequest request) {
        return ResponseEntity.ok(knowledgeBaseService.updateDocument(id, request));
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Delete knowledge document and its chunks (System Admin only)")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        knowledgeBaseService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documents")
    @Operation(summary = "List knowledge documents with pagination")
    public ResponseEntity<Page<KnowledgeDocumentDto>> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(knowledgeBaseService.getAllDocuments(pageable));
    }

    @GetMapping("/documents/{id}")
    @Operation(summary = "Get knowledge document by ID")
    public ResponseEntity<KnowledgeDocumentDto> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeBaseService.getDocumentById(id));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Re-index all active knowledge documents (System Admin only)")
    public ResponseEntity<String> reindexAll() {
        knowledgeBaseService.reindexAll();
        return ResponseEntity.ok("Successfully reindexed knowledge base chunks.");
    }
}
