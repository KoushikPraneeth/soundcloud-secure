package com.koushik.soundcloud.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt.supabase")
public class JwtProperties {
    private String secret;
    private String issuer;
    private long expiration;
}
