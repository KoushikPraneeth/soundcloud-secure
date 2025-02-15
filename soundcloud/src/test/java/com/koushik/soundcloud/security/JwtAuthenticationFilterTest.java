package com.koushik.soundcloud.security;

import static org.mockito.Mockito.*;

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

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
        
        when(jwtProperties.getSecret()).thenReturn(SECRET);
        when(jwtProperties.getIssuer()).thenReturn("supabase");
        
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
        verify(jwtProperties).getSecret();
        verify(jwtProperties).getIssuer();
        assert SecurityContextHolder.getContext().getAuthentication() != null;
        assert SecurityContextHolder.getContext().getAuthentication().getName().equals(USER_ID);
    }

    @Test
    void doFilterInternal_WithoutToken_ContinuesChain() throws Exception {
        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtProperties, never()).getSecret();
        verify(jwtProperties, never()).getIssuer();
        assert SecurityContextHolder.getContext().getAuthentication() == null;
    }

    @Test
    void doFilterInternal_WithInvalidToken_DoesNotSetAuthentication() throws Exception {
        // Arrange
        request.addHeader("Authorization", "Bearer invalid-token");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtProperties).getSecret();
        assert SecurityContextHolder.getContext().getAuthentication() == null;
    }

    private String createValidToken() {
        return Jwts.builder()
            .setSubject(USER_ID)
            .setIssuer("supabase")
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }
}
