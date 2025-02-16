package com.koushik.soundcloud.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import com.koushik.soundcloud.config.JwtProperties;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private MockHttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    private static final String SECRET = "your-test-secret-key-must-be-at-least-256-bits-long";
    private static final String USER_ID = "test-user-id";
    private static final String EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
        
        // Mock JWT properties
        when(jwtProperties.getSecret()).thenReturn(SECRET);
        when(jwtProperties.getIssuer()).thenReturn("supabase");
        when(jwtProperties.getAudience()).thenReturn("authenticated");
        when(jwtProperties.getJwtRole()).thenReturn("authenticated");
        
        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WithValidToken_SetsAuthentication() throws Exception {
        // Arrange
        String token = createValidToken();
        request.addHeader("Authorization", "Bearer " + token);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Authentication should not be null");
        assertEquals(EMAIL, auth.getName(), "Authentication name should match email");
        assertTrue(auth.isAuthenticated(), "Authentication should be authenticated");
        assertEquals(1, auth.getAuthorities().size(), "Should have one authority");
        assertEquals("ROLE_USER", auth.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void doFilterInternal_WithoutToken_ContinuesChain() throws Exception {
        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        assertNull(SecurityContextHolder.getContext().getAuthentication(), 
            "Authentication should be null when no token is provided");
    }

    @Test
    void doFilterInternal_WithInvalidToken_DoesNotSetAuthentication() throws Exception {
        // Arrange
        request.addHeader("Authorization", "Bearer invalid-token");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        assertNull(SecurityContextHolder.getContext().getAuthentication(), 
            "Authentication should be null with invalid token");
    }

    private String createValidToken() {
        return Jwts.builder()
            .setSubject(USER_ID)
            .setIssuer("supabase")
            .setAudience("authenticated")
            .claim("role", "authenticated")
            .claim("email", EMAIL)
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }
}
