package com.koushik.soundcloud.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.service.CloudStorageService;

@Service
public class GoogleDriveStorageService implements CloudStorageService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveStorageService.class);

    @Override
    public List<CloudStorageFile> listFiles(String userId, String path) {
        log.info("Listing files for user {} at path {}", userId, path);
        return List.of(
            CloudStorageFile.builder()
                .id("example-id")
                .name("example.mp3")
                .mimeType("audio/mpeg")
                .size(1024L)
                .provider(CloudStorageProvider.GOOGLE_DRIVE)
                .build()
        );
    }

    @Override
    public CloudStorageFile getFile(String userId, String fileId) {
        log.info("Getting file {} for user {}", fileId, userId);
        return CloudStorageFile.builder()
            .id(fileId)
            .name("example.mp3")
            .mimeType("audio/mpeg")
            .size(1024L)
            .provider(CloudStorageProvider.GOOGLE_DRIVE)
            .build();
    }

    @Override
    public String getDownloadUrl(String userId, String fileId) {
        log.info("Getting download URL for file {} and user {}", fileId, userId);
        return "https://example-download-url.com/" + fileId;
    }

    @Override
    public List<CloudStorageFile> searchFiles(String userId, String query) {
        log.info("Searching files for user {} with query {}", userId, query);
        return List.of(
            CloudStorageFile.builder()
                .id("search-result-id")
                .name("searched-file.mp3")
                .mimeType("audio/mpeg")
                .size(1024L)
                .provider(CloudStorageProvider.GOOGLE_DRIVE)
                .build()
        );
    }
}
