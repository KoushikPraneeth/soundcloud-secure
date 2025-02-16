package com.koushik.soundcloud.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "google.drive")
public class GoogleDriveProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String applicationName;
    private String[] scopes = {"https://www.googleapis.com/auth/drive.file"};
    private String tokenStorageDirectory = "tokens";
}
