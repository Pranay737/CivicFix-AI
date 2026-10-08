package com.civicfix.dto;

import com.civicfix.domain.Priority;
import com.civicfix.domain.SlaPolicy;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlaPolicyDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Priority priority;

    @Min(value = 1, message = "Resolution hours must be at least 1")
    private int resolutionHours;

    public static SlaPolicyDto fromEntity(SlaPolicy policy) {
        if (policy == null) return null;
        return SlaPolicyDto.builder()
                .id(policy.getId())
                .categoryId(policy.getCategory() != null ? policy.getCategory().getId() : null)
                .categoryName(policy.getCategory() != null ? policy.getCategory().getName() : null)
                .priority(policy.getPriority())
                .resolutionHours(policy.getResolutionHours())
                .build();
    }
}
