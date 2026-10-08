package com.civicfix.ai;

import com.civicfix.domain.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTriageResult {
    private String category;
    private Priority priority;
    private String department;
    private String summary;
    private Double confidence;
    private String reasoning;
}
