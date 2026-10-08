package com.civicfix;

import com.civicfix.domain.Role;
import com.civicfix.domain.User;
import com.civicfix.dto.AuthResponse;
import com.civicfix.dto.LoginRequest;
import com.civicfix.dto.RegisterRequest;
import com.civicfix.security.JwtTokenProvider;
import com.civicfix.security.UserPrincipal;
import com.civicfix.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CivicFixApplicationTests {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        assertNotNull(jwtTokenProvider);
        assertNotNull(passwordEncoder);
        assertNotNull(authService);
    }

    @Test
    @DisplayName("JWT Token generation, parsing and validation works")
    void testJwtTokenProvider() {
        User user = User.builder()
                .id(999L)
                .email("test.citizen@civicfix.ai")
                .passwordHash(passwordEncoder.encode("Secret@123"))
                .fullName("Test Citizen")
                .role(Role.CITIZEN)
                .active(true)
                .build();

        UserPrincipal principal = UserPrincipal.create(user);
        String token = jwtTokenProvider.generateAccessToken(principal);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(999L, jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("test.citizen@civicfix.ai", jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    @DisplayName("Citizen Registration and Login Flow works end-to-end")
    void testRegisterAndLogin() {
        String testEmail = "unique.citizen." + System.currentTimeMillis() + "@civicfix.ai";
        RegisterRequest registerReq = RegisterRequest.builder()
                .fullName("Sarah Walker")
                .email(testEmail)
                .password("Password@123")
                .phone("+1-555-8888")
                .build();

        AuthResponse regResponse = authService.register(registerReq);
        assertNotNull(regResponse.getAccessToken());
        assertNotNull(regResponse.getRefreshToken());
        assertEquals(testEmail, regResponse.getUser().getEmail());
        assertEquals(Role.CITIZEN, regResponse.getUser().getRole());

        // Test Login
        LoginRequest loginReq = LoginRequest.builder()
                .email(testEmail)
                .password("Password@123")
                .build();

        AuthResponse loginResponse = authService.login(loginReq);
        assertNotNull(loginResponse.getAccessToken());
        assertNotNull(loginResponse.getRefreshToken());
        assertEquals(testEmail, loginResponse.getUser().getEmail());

        // Test Token Refresh
        AuthResponse refreshResponse = authService.refreshToken(loginResponse.getRefreshToken());
        assertNotNull(refreshResponse.getAccessToken());
        assertNotNull(refreshResponse.getRefreshToken());
        assertNotEquals(loginResponse.getRefreshToken(), refreshResponse.getRefreshToken(), "Refresh token should rotate");
    }

    @Test
    @DisplayName("Seeded System Admin logs in successfully")
    void testSeededAdminLogin() {
        LoginRequest loginReq = LoginRequest.builder()
                .email("admin@civicfix.ai")
                .password("Admin@12345")
                .build();

        AuthResponse loginResponse = authService.login(loginReq);
        assertNotNull(loginResponse.getAccessToken());
        assertEquals(Role.SYSTEM_ADMIN, loginResponse.getUser().getRole());
    }
}
