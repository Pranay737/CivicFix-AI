package com.civicfix.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateKnowledgeDocumentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String source;
    private String category;

    @NotBlank(message = "Content is required")
    private String content;

    @Builder.Default
    private boolean active = true;
}
