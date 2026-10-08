package com.civicfix.service;

import com.civicfix.ai.EmbeddingClient;
import com.civicfix.ai.VectorUtils;
import com.civicfix.domain.KnowledgeChunk;
import com.civicfix.domain.KnowledgeDocument;
import com.civicfix.dto.CreateKnowledgeDocumentRequest;
import com.civicfix.dto.KnowledgeDocumentDto;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.KnowledgeChunkRepository;
import com.civicfix.repository.KnowledgeDocumentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeBaseService {

    private final KnowledgeDocumentRepository documentRepository;
    private final KnowledgeChunkRepository chunkRepository;
    private final EmbeddingClient embeddingClient;

    @PostConstruct
    public void initDefaultIndex() {
        try {
            long chunkCount = chunkRepository.count();
            if (chunkCount == 0) {
                log.info("Knowledge chunks table is empty. Initializing embeddings for seeded civic documents...");
                reindexAll();
            }
        } catch (Exception e) {
            log.warn("Knowledge base auto-indexing skipped on startup: {}", e.getMessage());
        }
    }

    @Transactional
    public KnowledgeDocumentDto createDocument(CreateKnowledgeDocumentRequest request) {
        KnowledgeDocument doc = KnowledgeDocument.builder()
                .title(request.getTitle().trim())
                .source(request.getSource() != null ? request.getSource().trim() : "Municipal Policy")
                .category(request.getCategory() != null ? request.getCategory().trim() : "General")
                .content(request.getContent().trim())
                .active(request.isActive())
                .build();

        doc = documentRepository.save(doc);
        chunkAndIndex(doc);

        log.info("Created knowledge document #{} '{}' with indexed chunks", doc.getId(), doc.getTitle());
        return KnowledgeDocumentDto.fromEntity(doc);
    }

    @Transactional
    public KnowledgeDocumentDto updateDocument(Long id, CreateKnowledgeDocumentRequest request) {
        KnowledgeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge document not found with id: " + id));

        doc.setTitle(request.getTitle().trim());
        doc.setSource(request.getSource());
        doc.setCategory(request.getCategory());
        doc.setContent(request.getContent().trim());
        doc.setActive(request.isActive());

        doc = documentRepository.save(doc);
        chunkAndIndex(doc);

        return KnowledgeDocumentDto.fromEntity(doc);
    }

    @Transactional
    public void deleteDocument(Long id) {
        KnowledgeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge document not found with id: " + id));
        documentRepository.delete(doc);
        log.info("Deleted knowledge document #{}", id);
    }

    @Transactional(readOnly = true)
    public Page<KnowledgeDocumentDto> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable)
                .map(KnowledgeDocumentDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public KnowledgeDocumentDto getDocumentById(Long id) {
        KnowledgeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge document not found with id: " + id));
        return KnowledgeDocumentDto.fromEntity(doc);
    }

    @Transactional
    public void reindexAll() {
        List<KnowledgeDocument> activeDocs = documentRepository.findAllByActiveTrue();
        for (KnowledgeDocument doc : activeDocs) {
            chunkAndIndex(doc);
        }
        log.info("Successfully re-indexed {} knowledge documents", activeDocs.size());
    }

    private void chunkAndIndex(KnowledgeDocument doc) {
        if (doc.getChunks() == null) {
            doc.setChunks(new ArrayList<>());
        } else {
            doc.getChunks().clear();
        }

        if (!doc.isActive() || doc.getContent() == null || doc.getContent().isBlank()) {
            documentRepository.save(doc);
            return;
        }

        List<String> chunks = splitIntoChunks(doc.getContent(), 350, 50);

        for (int i = 0; i < chunks.size(); i++) {
            String chunkText = chunks.get(i);
            List<Float> embedding = embeddingClient.generateEmbedding(chunkText);

            KnowledgeChunk chunk = KnowledgeChunk.builder()
                    .document(doc)
                    .chunkIndex(i)
                    .chunkText(chunkText)
                    .embedding(VectorUtils.serializeVector(embedding))
                    .build();
            doc.getChunks().add(chunk);
        }

        documentRepository.save(doc);
    }

    /**
     * Splits text into overlapping word chunks (~350 words per chunk with 50 words overlap)
     */
    private List<String> splitIntoChunks(String text, int targetWords, int overlapWords) {
        String[] words = text.split("\\s+");
        if (words.length <= targetWords) {
            return List.of(text.trim());
        }

        List<String> result = new ArrayList<>();
        int start = 0;

        while (start < words.length) {
            int end = Math.min(start + targetWords, words.length);
            String chunk = String.join(" ", Arrays.copyOfRange(words, start, end));
            result.add(chunk);

            if (end >= words.length) break;
            start += (targetWords - overlapWords);
        }

        return result;
    }
}
