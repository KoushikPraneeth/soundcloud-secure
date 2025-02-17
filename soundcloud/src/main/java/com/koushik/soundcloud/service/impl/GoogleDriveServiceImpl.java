package com.koushik.soundcloud.service.impl;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.service.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.mp3.Mp3Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleDriveServiceImpl implements GoogleDriveService {

    private final Drive driveService;
    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
        "audio/aac", "audio/ogg", "audio/flac"
    );

    @Override
    public CloudStorageFile uploadFile(MultipartFile file, String userId) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AUDIO_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only audio files are allowed.");
        }

        File fileMetadata = new File();
        fileMetadata.setName(file.getOriginalFilename());
        fileMetadata.setMimeType(contentType);

        // Extract audio metadata
        Metadata metadata = extractAudioMetadata(file);
        
        com.google.api.client.http.InputStreamContent mediaContent = new com.google.api.client.http.InputStreamContent(
            contentType,
            file.getInputStream()
        );

        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
            .setFields("id, name, mimeType, size, webViewLink")
            .execute();

        CloudStorageFile cloudFile = convertToCloudStorageFile(uploadedFile);
        // Add metadata if available
        if (metadata.get("xmpDM:artist") != null) {
            cloudFile.setMetadata("artist", metadata.get("xmpDM:artist"));
        }
        if (metadata.get("xmpDM:album") != null) {
            cloudFile.setMetadata("album", metadata.get("xmpDM:album"));
        }
        if (metadata.get("xmpDM:duration") != null) {
            cloudFile.setMetadata("duration", metadata.get("xmpDM:duration"));
        }

        return cloudFile;
    }

    @Override
    public byte[] downloadFile(String fileId, String userId) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        driveService.files().get(fileId)
            .executeMediaAndDownloadTo(outputStream);
        return outputStream.toByteArray();
    }

    @Override
    public List<CloudStorageFile> listFiles(String userId) throws IOException {
        List<CloudStorageFile> results = new ArrayList<>();
        String pageToken = null;
        String query = "mimeType contains 'audio/'";

        do {
            FileList result = driveService.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("nextPageToken, files(id, name, mimeType, size, webViewLink)")
                .setPageToken(pageToken)
                .execute();

            for (File file : result.getFiles()) {
                if (ALLOWED_AUDIO_TYPES.contains(file.getMimeType())) {
                    results.add(convertToCloudStorageFile(file));
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);

        return results;
    }

    @Override
    public void deleteFile(String fileId, String userId) throws IOException {
        driveService.files().delete(fileId).execute();
    }

    @Override
    public CloudStorageFile getFileMetadata(String fileId, String userId) throws IOException {
        File file = driveService.files().get(fileId)
            .setFields("id, name, mimeType, size, webViewLink")
            .execute();

        if (!file.getMimeType().startsWith("audio/")) {
            throw new IllegalArgumentException("File is not an audio file");
        }

        return convertToCloudStorageFile(file);
    }

    private CloudStorageFile convertToCloudStorageFile(File file) {
        return CloudStorageFile.builder()
            .id(file.getId())
            .name(file.getName())
            .mimeType(file.getMimeType())
            .size(file.getSize() != null ? file.getSize() : 0)
            .webViewLink(file.getWebViewLink())
            .downloadUrl("/api/stream/" + file.getId()) // Use our streaming endpoint
            .provider(CloudStorageProvider.GOOGLE_DRIVE)
            .build();
    }

    private Metadata extractAudioMetadata(MultipartFile file) {
        try {
            BodyContentHandler handler = new BodyContentHandler();
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();
            Parser parser = new Mp3Parser();
            
            try (InputStream stream = file.getInputStream()) {
                parser.parse(stream, handler, metadata, context);
            }
            
            return metadata;
        } catch (Exception e) {
            log.warn("Failed to extract audio metadata: {}", e.getMessage());
            return new Metadata();
        }
    }
}
