package com.koushik.soundcloud.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "google")
public class GoogleDriveProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String applicationName;
    private String tokenDirectory;
    private String[] scopes = {
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.metadata.readonly"
    };
}
