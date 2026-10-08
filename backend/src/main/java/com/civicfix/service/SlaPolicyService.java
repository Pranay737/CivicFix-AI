package com.civicfix.service;

import com.civicfix.domain.SlaPolicy;
import com.civicfix.dto.SlaPolicyDto;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.SlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlaPolicyService {

    private final SlaPolicyRepository slaPolicyRepository;

    @Transactional(readOnly = true)
    public List<SlaPolicyDto> getAllPolicies() {
        return slaPolicyRepository.findAll().stream()
                .map(SlaPolicyDto::fromEntity)
                .toList();
    }

    @Transactional
    public SlaPolicyDto updatePolicy(Long id, int resolutionHours) {
        SlaPolicy policy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA Policy not found with id: " + id));
        policy.setResolutionHours(resolutionHours);
        policy = slaPolicyRepository.save(policy);
        return SlaPolicyDto.fromEntity(policy);
    }
}
