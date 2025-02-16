package com.koushik.soundcloud.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class GoogleDriveConfig {

    private final GoogleDriveProperties properties;
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    @Bean
    public Drive driveService() throws GeneralSecurityException, IOException {
        final NetHttpTransport httpTransport = new NetHttpTransport();
        return new Drive.Builder(httpTransport, JSON_FACTORY, null)
                .setApplicationName(properties.getApplicationName())
                .build();
    }

    @Bean
    public GoogleAuthorizationCodeFlow authorizationCodeFlow() throws IOException, GeneralSecurityException {
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
                .setInstalled(new GoogleClientSecrets.Details()
                        .setClientId(properties.getClientId())
                        .setClientSecret(properties.getClientSecret())
                        .setRedirectUris(Collections.singletonList(properties.getRedirectUri())));

        return new GoogleAuthorizationCodeFlow.Builder(
                new NetHttpTransport(),
                JSON_FACTORY,
                clientSecrets,
                Arrays.asList(properties.getScopes()))
                .setDataStoreFactory(new FileDataStoreFactory(new File(properties.getTokenStorageDirectory())))
                .setAccessType("offline")
                .build();
    }
}
