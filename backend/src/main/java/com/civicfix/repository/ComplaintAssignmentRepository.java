package com.civicfix.repository;

import com.civicfix.domain.ComplaintAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintIdOrderByAssignedAtDesc(Long complaintId);
    Optional<ComplaintAssignment> findByComplaintIdAndStatus(Long complaintId, String status);
    List<ComplaintAssignment> findByOfficerIdAndStatus(Long officerId, String status);
    long countByOfficerIdAndStatus(Long officerId, String status);
}
