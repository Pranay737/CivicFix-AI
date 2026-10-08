package com.civicfix.service;

import com.civicfix.domain.AuditLog;
import com.civicfix.domain.User;
import com.civicfix.dto.AuditLogDto;
import com.civicfix.repository.AuditLogRepository;
import com.civicfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(Long userId, String action, String entityType, String entityId, String details, String ipAddress) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(auditLog);
        log.info("Audit log: action={} entity={} id={} by user={}", action, entityType, entityId, (user != null ? user.getEmail() : "System"));
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable)
                .map(AuditLogDto::fromEntity);
    }
}
