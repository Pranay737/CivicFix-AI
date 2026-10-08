package com.civicfix.dto;

import com.civicfix.domain.Category;
import com.civicfix.domain.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private String departmentName;

    @Builder.Default
    private Priority defaultPriority = Priority.MEDIUM;

    private boolean active;
    private LocalDateTime createdAt;

    public static CategoryDto fromEntity(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .departmentId(category.getDepartment() != null ? category.getDepartment().getId() : null)
                .departmentName(category.getDepartment() != null ? category.getDepartment().getName() : null)
                .defaultPriority(category.getDefaultPriority())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
