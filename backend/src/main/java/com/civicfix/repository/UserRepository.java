package com.civicfix.repository;

import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByDepartmentIdAndRole(Long departmentId, Role role);
    Page<User> findAll(Pageable pageable);
    long countByRole(Role role);
}
