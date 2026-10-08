package com.civicfix.repository;

import com.civicfix.domain.Priority;
import com.civicfix.domain.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
    Optional<SlaPolicy> findByCategoryIdAndPriority(Long categoryId, Priority priority);
    List<SlaPolicy> findByCategoryId(Long categoryId);
}
