package com.civicfix.dto;

import com.civicfix.domain.Resolution;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolutionDto {
    private Long id;
    private Long officerId;
    private String officerName;
    private String notes;
    private String evidenceImagesJson;
    private LocalDateTime resolvedAt;

    public static ResolutionDto fromEntity(Resolution resolution) {
        if (resolution == null) return null;
        return ResolutionDto.builder()
                .id(resolution.getId())
                .officerId(resolution.getOfficer() != null ? resolution.getOfficer().getId() : null)
                .officerName(resolution.getOfficer() != null ? resolution.getOfficer().getFullName() : null)
                .notes(resolution.getNotes())
                .evidenceImagesJson(resolution.getEvidenceImagesJson())
                .resolvedAt(resolution.getResolvedAt())
                .build();
    }
}
