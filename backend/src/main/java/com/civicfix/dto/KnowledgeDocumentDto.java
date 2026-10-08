package com.civicfix.dto;

import com.civicfix.domain.KnowledgeDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeDocumentDto {
    private Long id;
    private String title;
    private String source;
    private String category;
    private String content;
    private int chunkCount;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static KnowledgeDocumentDto fromEntity(KnowledgeDocument doc) {
        if (doc == null) return null;
        return KnowledgeDocumentDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .source(doc.getSource())
                .category(doc.getCategory())
                .content(doc.getContent())
                .chunkCount(doc.getChunks() != null ? doc.getChunks().size() : 0)
                .active(doc.isActive())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }
}
