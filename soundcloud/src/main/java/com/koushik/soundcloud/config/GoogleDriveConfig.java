package com.koushik.soundcloud.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.web.context.annotation.RequestScope;

@Configuration
@RequiredArgsConstructor
public class GoogleDriveConfig {

    private final GoogleDriveProperties properties;
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private NetHttpTransport httpTransport;

    @Bean
    public NetHttpTransport httpTransport() throws GeneralSecurityException, IOException {
        if (httpTransport == null) {
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        }
        return httpTransport;
    }

    @Bean
    public GoogleAuthorizationCodeFlow authorizationCodeFlow() throws GeneralSecurityException, IOException {
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
                .setWeb(new GoogleClientSecrets.Details()
                        .setClientId(properties.getClientId())
                        .setClientSecret(properties.getClientSecret())
                        .setRedirectUris(List.of(properties.getRedirectUri())));

        return new GoogleAuthorizationCodeFlow.Builder(
                httpTransport(),
                JSON_FACTORY,
                clientSecrets,
                Arrays.asList(properties.getScopes()))
                .setDataStoreFactory(new FileDataStoreFactory(new File(properties.getTokenDirectory())))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();
    }

    public Credential getCredential(String userId) throws IOException, GeneralSecurityException {
        return Optional.ofNullable(authorizationCodeFlow().loadCredential(userId))
                .orElseThrow(() -> new IOException("User not authorized with Google Drive: " + userId));
    }

    @Bean
    @RequestScope
    public Drive driveService() throws GeneralSecurityException, IOException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Credential credential = getCredential(userId);

        return new Drive.Builder(httpTransport(), JSON_FACTORY, credential)
                .setApplicationName(properties.getApplicationName())
                .build();
    }
}
