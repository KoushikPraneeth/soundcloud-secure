package com.koushik.soundcloud.service.impl;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.koushik.soundcloud.config.GoogleDriveProperties;
import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.service.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleDriveServiceImpl implements GoogleDriveService {

    private final GoogleAuthorizationCodeFlow flow;
    private final GoogleDriveProperties properties;

    private Drive getDriveService(String userId) throws IOException {
        Credential credential = flow.loadCredential(userId);
        if (credential == null) {
            throw new IOException("User not authorized with Google Drive");
        }

        // Build Drive service with credential during construction
        return new Drive.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                .setApplicationName(properties.getApplicationName()) // Set application name from properties
                .build();
    }

    @Override
    public CloudStorageFile uploadFile(MultipartFile file, String userId) throws IOException {
        Drive userDriveService = getDriveService(userId);

        File fileMetadata = new File();
        fileMetadata.setName(file.getOriginalFilename());

        InputStreamContent mediaContent = new InputStreamContent(
                file.getContentType(),
                file.getInputStream()
        );

        File uploadedFile = userDriveService.files().create(fileMetadata, mediaContent)
                .setFields("id, name, mimeType, size, webViewLink")
                .execute();

        return convertToCloudStorageFile(uploadedFile);
    }

    @Override
    public byte[] downloadFile(String fileId, String userId) throws IOException {
        Drive userDriveService = getDriveService(userId);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        userDriveService.files().get(fileId)
                .executeMediaAndDownloadTo(outputStream);

        return outputStream.toByteArray();
    }

    @Override
    public List<CloudStorageFile> listFiles(String userId) throws IOException {
        Drive userDriveService = getDriveService(userId);

        List<CloudStorageFile> results = new ArrayList<>();
        String pageToken = null;

        do {
            FileList result = userDriveService.files().list()
                    .setSpaces("drive")
                    .setFields("nextPageToken, files(id, name, mimeType, size, webViewLink)")
                    .setPageToken(pageToken)
                    .execute();

            for (File file : result.getFiles()) {
                results.add(convertToCloudStorageFile(file));
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);

        return results;
    }

    @Override
    public void deleteFile(String fileId, String userId) throws IOException {
        Drive userDriveService = getDriveService(userId);
        userDriveService.files().delete(fileId).execute();
    }

    @Override
    public CloudStorageFile getFileMetadata(String fileId, String userId) throws IOException {
        Drive userDriveService = getDriveService(userId);

        File file = userDriveService.files().get(fileId)
                .setFields("id, name, mimeType, size, webViewLink")
                .execute();

        return convertToCloudStorageFile(file);
    }

    private CloudStorageFile convertToCloudStorageFile(File file) {
        return CloudStorageFile.builder()
                .id(file.getId())
                .name(file.getName())
                .mimeType(file.getMimeType())
                .size(file.getSize() != null ? file.getSize() : 0)
                .webViewLink(file.getWebViewLink())
                .downloadUrl(file.getId()) // We'll use the file ID as the download URL, which will be handled by our download endpoint
                .provider(CloudStorageProvider.GOOGLE_DRIVE)
                .build();
    }
}
