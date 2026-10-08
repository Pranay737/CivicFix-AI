package com.civicfix.security;

import com.civicfix.domain.Role;
import com.civicfix.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public static Role getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    public static Long getCurrentUserDepartmentId() {
        return getCurrentUser().getDepartmentId();
    }

    public static boolean isCitizen() {
        return getCurrentUserRole() == Role.CITIZEN;
    }

    public static boolean isOfficer() {
        return getCurrentUserRole() == Role.OFFICER;
    }

    public static boolean isDeptAdmin() {
        return getCurrentUserRole() == Role.DEPARTMENT_ADMIN;
    }

    public static boolean isSystemAdmin() {
        return getCurrentUserRole() == Role.SYSTEM_ADMIN;
    }
}
