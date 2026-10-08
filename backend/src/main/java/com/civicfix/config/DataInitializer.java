package com.civicfix.config;

import com.civicfix.domain.Department;
import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import com.civicfix.repository.DepartmentRepository;
import com.civicfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding demo users...");

        Department roads = departmentRepository.findByCode("ROADS").orElse(null);
        Department sanitation = departmentRepository.findByCode("SANITATION").orElse(null);
        Department electricity = departmentRepository.findByCode("ELECTRICITY").orElse(null);

        // 1. System Admin
        createUserIfNotFound(
                "admin@civicfix.ai",
                "Admin@12345",
                "Global System Administrator",
                "+1-555-0100",
                Role.SYSTEM_ADMIN,
                null
        );

        // 2. Department Admins
        createUserIfNotFound(
                "roads.admin@civicfix.ai",
                "Admin@12345",
                "Marcus Vance (Roads Admin)",
                "+1-555-0101",
                Role.DEPARTMENT_ADMIN,
                roads
        );

        createUserIfNotFound(
                "sanitation.admin@civicfix.ai",
                "Admin@12345",
                "Priya Sharma (Sanitation Admin)",
                "+1-555-0102",
                Role.DEPARTMENT_ADMIN,
                sanitation
        );

        createUserIfNotFound(
                "electricity.admin@civicfix.ai",
                "Admin@12345",
                "David Chen (Electricity Admin)",
                "+1-555-0103",
                Role.DEPARTMENT_ADMIN,
                electricity
        );

        // 3. Officers
        createUserIfNotFound(
                "officer.smith@civicfix.ai",
                "Officer@12345",
                "Officer John Smith",
                "+1-555-0111",
                Role.OFFICER,
                roads
        );

        createUserIfNotFound(
                "officer.garcia@civicfix.ai",
                "Officer@12345",
                "Officer Elena Garcia",
                "+1-555-0112",
                Role.OFFICER,
                sanitation
        );

        createUserIfNotFound(
                "officer.patel@civicfix.ai",
                "Officer@12345",
                "Officer Aarav Patel",
                "+1-555-0113",
                Role.OFFICER,
                electricity
        );

        // 4. Citizen
        createUserIfNotFound(
                "citizen.jane@civicfix.ai",
                "Citizen@12345",
                "Jane Doe (Demo Citizen)",
                "+1-555-0199",
                Role.CITIZEN,
                null
        );

        log.info("Demo users initialized successfully.");
    }

    private void createUserIfNotFound(String email, String rawPassword, String name, String phone, Role role, Department dept) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .fullName(name)
                    .phone(phone)
                    .role(role)
                    .department(dept)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("Created demo user: {} [{}]", email, role);
        }
    }
}
