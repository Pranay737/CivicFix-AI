package com.civicfix.dto;

import com.civicfix.domain.ChatMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String sender;
    private String message;
    private List<String> citations;
    private LocalDateTime createdAt;

    public static ChatMessageDto fromEntity(ChatMessage msg, ObjectMapper objectMapper) {
        if (msg == null) return null;
        List<String> cites = List.of();
        if (msg.getCitationsJson() != null && !msg.getCitationsJson().isBlank()) {
            try {
                cites = objectMapper.readValue(msg.getCitationsJson(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        return ChatMessageDto.builder()
                .id(msg.getId())
                .sender(msg.getSender())
                .message(msg.getMessage())
                .citations(cites)
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
