package com.civicfix.dto;

import com.civicfix.domain.ChatSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionDto {
    private Long id;
    private String sessionUuid;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChatSessionDto fromEntity(ChatSession session) {
        if (session == null) return null;
        return ChatSessionDto.builder()
                .id(session.getId())
                .sessionUuid(session.getSessionUuid())
                .title(session.getTitle())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
