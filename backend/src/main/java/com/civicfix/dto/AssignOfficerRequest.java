package com.civicfix.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignOfficerRequest {
    @NotNull(message = "Officer ID is required")
    private Long officerId;
    private String notes;
}
