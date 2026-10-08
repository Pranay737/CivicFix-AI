package com.civicfix.repository;

import com.civicfix.domain.Complaint;
import com.civicfix.domain.ComplaintStatus;
import com.civicfix.domain.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByTrackingNumber(String trackingNumber);

    Page<Complaint> findByCitizenId(Long citizenId, Pageable pageable);

    Page<Complaint> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<Complaint> findByDepartmentIdAndStatus(Long departmentId, ComplaintStatus status, Pageable pageable);

    @Query("SELECT c FROM Complaint c JOIN c.assignments a WHERE a.officer.id = :officerId AND a.status = 'ACTIVE'")
    Page<Complaint> findByAssignedOfficerId(@Param("officerId") Long officerId, Pageable pageable);

    @Query("SELECT c FROM Complaint c JOIN c.assignments a WHERE a.officer.id = :officerId AND a.status = 'ACTIVE' AND c.status = :status")
    Page<Complaint> findByAssignedOfficerIdAndStatus(@Param("officerId") Long officerId, @Param("status") ComplaintStatus status, Pageable pageable);

    long countByStatus(ComplaintStatus status);

    long countByDepartmentId(Long departmentId);

    long countByDepartmentIdAndStatus(Long departmentId, ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.department.id = :deptId AND c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') AND c.slaDueAt < :now")
    long countOverdueByDepartmentId(@Param("deptId") Long deptId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') AND c.slaDueAt < :now")
    long countTotalOverdue(@Param("now") LocalDateTime now);

    // Candidates for duplicate detection within time window and category
    @Query("SELECT c FROM Complaint c WHERE c.category.id = :categoryId AND c.createdAt >= :since AND c.id != :excludeId AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
    List<Complaint> findCandidatesForDuplicate(
            @Param("categoryId") Long categoryId,
            @Param("since") LocalDateTime since,
            @Param("excludeId") Long excludeId
    );

    List<Complaint> findByDepartmentIdAndCreatedAtAfter(Long departmentId, LocalDateTime after);

    List<Complaint> findByCreatedAtAfter(LocalDateTime after);

    List<Complaint> findByDepartmentIdAndStatusIn(Long departmentId, List<ComplaintStatus> statuses);

    List<Complaint> findByStatusIn(List<ComplaintStatus> statuses);
}
