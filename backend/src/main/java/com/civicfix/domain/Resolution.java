package com.civicfix.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resolutions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(name = "evidence_images_json", columnDefinition = "TEXT")
    private String evidenceImagesJson;

    @Column(name = "resolved_at", nullable = false)
    @Builder.Default
    private LocalDateTime resolvedAt = LocalDateTime.now();
}
