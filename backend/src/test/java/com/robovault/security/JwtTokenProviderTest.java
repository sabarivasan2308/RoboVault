package com.robovault.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String VALID_SECRET = "RoboVaultSecure2026EnterpriseKeyRequiresAtLeast32BytesForHmacShaSigning!";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @Test
    void testInitialization_ValidSecret_Success() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, EXPIRATION_MS);
        assertNotNull(provider);
    }

    @Test
    void testInitialization_NullSecret_ThrowsIllegalStateException() {
        assertThrows(IllegalStateException.class, () -> new JwtTokenProvider(null, EXPIRATION_MS));
    }

    @Test
    void testInitialization_EmptySecret_ThrowsIllegalStateException() {
        assertThrows(IllegalStateException.class, () -> new JwtTokenProvider("   ", EXPIRATION_MS));
    }

    @Test
    void testInitialization_ShortSecret_ThrowsIllegalArgumentException() {
        // 16 bytes (< 32 bytes / 256 bits requirement)
        String shortSecret = "ShortSecret1234!";
        assertThrows(IllegalArgumentException.class, () -> new JwtTokenProvider(shortSecret, EXPIRATION_MS));
    }

    @Test
    void testTokenGenerationAndValidation_Success() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, EXPIRATION_MS);

        UserPrincipal principal = new UserPrincipal(
                "usr-001",
                "admin@robovault.edu",
                "encoded-hash",
                "Dr. Sarah Chen",
                true,
                Collections.emptyList()
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = provider.generateToken(auth);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(provider.validateToken(token));
        assertEquals("admin@robovault.edu", provider.getUsernameFromJwt(token));
    }

    @Test
    void testValidateToken_InvalidToken_ReturnsFalse() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, EXPIRATION_MS);
        assertFalse(provider.validateToken("invalid.jwt.token"));
    }
}
