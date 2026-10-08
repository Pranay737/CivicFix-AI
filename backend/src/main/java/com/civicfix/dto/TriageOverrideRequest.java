package com.civicfix.dto;

import com.civicfix.domain.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageOverrideRequest {
    private Long categoryId;
    private Long departmentId;
    private Priority priority;
    private String reason;
}
