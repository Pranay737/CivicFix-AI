package com.civicfix.dto;

import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Long departmentId;
    private String departmentName;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        Long deptId = null;
        String deptName = null;
        try {
            if (user.getDepartment() != null) {
                deptId = user.getDepartment().getId();
                deptName = user.getDepartment().getName();
            }
        } catch (Exception ignored) {
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .departmentId(deptId)
                .departmentName(deptName)
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
