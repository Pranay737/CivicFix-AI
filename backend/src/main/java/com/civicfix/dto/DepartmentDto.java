package com.civicfix.dto;

import com.civicfix.domain.Department;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private Long id;
    
    @NotBlank(message = "Department name is required")
    private String name;
    
    @NotBlank(message = "Department code is required")
    private String code;
    
    private String description;
    private boolean active;
    private LocalDateTime createdAt;

    public static DepartmentDto fromEntity(Department dept) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .description(dept.getDescription())
                .active(dept.isActive())
                .createdAt(dept.getCreatedAt())
                .build();
    }
}
