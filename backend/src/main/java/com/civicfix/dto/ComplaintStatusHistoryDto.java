package com.civicfix.dto;

import com.civicfix.domain.ComplaintStatus;
import com.civicfix.domain.ComplaintStatusHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatusHistoryDto {
    private Long id;
    private ComplaintStatus previousStatus;
    private ComplaintStatus newStatus;
    private Long changedById;
    private String changedByName;
    private String comment;
    private LocalDateTime createdAt;

    public static ComplaintStatusHistoryDto fromEntity(ComplaintStatusHistory history) {
        if (history == null) return null;
        return ComplaintStatusHistoryDto.builder()
                .id(history.getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedById(history.getChangedBy() != null ? history.getChangedBy().getId() : null)
                .changedByName(history.getChangedBy() != null ? history.getChangedBy().getFullName() : "System")
                .comment(history.getComment())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
