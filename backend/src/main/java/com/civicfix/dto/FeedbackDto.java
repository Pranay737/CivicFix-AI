package com.civicfix.dto;

import com.civicfix.domain.Feedback;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private Long citizenId;
    private String citizenName;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;

    private String comment;
    private LocalDateTime createdAt;

    public static FeedbackDto fromEntity(Feedback feedback) {
        if (feedback == null) return null;
        return FeedbackDto.builder()
                .id(feedback.getId())
                .citizenId(feedback.getCitizen() != null ? feedback.getCitizen().getId() : null)
                .citizenName(feedback.getCitizen() != null ? feedback.getCitizen().getFullName() : null)
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
