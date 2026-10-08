package com.civicfix.dto;

import com.civicfix.domain.ComplaintImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintImageDto {
    private Long id;
    private String imageUrl;
    private String publicId;
    private String caption;
    private LocalDateTime createdAt;

    public static ComplaintImageDto fromEntity(ComplaintImage image) {
        if (image == null) return null;
        return ComplaintImageDto.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .publicId(image.getPublicId())
                .caption(image.getCaption())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
