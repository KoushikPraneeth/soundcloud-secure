package com.koushik.soundcloud.controller;

import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.service.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
public class CloudStorageController {

    private final GoogleDriveService googleDriveService;

    @PostMapping("/upload")
    public ResponseEntity<CloudStorageFile> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        CloudStorageFile uploadedFile = googleDriveService.uploadFile(file, authentication.getName());
        return ResponseEntity.ok(uploadedFile);
    }

    @GetMapping("/files")
    public ResponseEntity<List<CloudStorageFile>> listFiles(Authentication authentication) throws IOException {
        List<CloudStorageFile> files = googleDriveService.listFiles(authentication.getName());
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<CloudStorageFile> getFileMetadata(
            @PathVariable String fileId,
            Authentication authentication) throws IOException {
        CloudStorageFile file = googleDriveService.getFileMetadata(fileId, authentication.getName());
        return ResponseEntity.ok(file);
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileId,
            Authentication authentication) throws IOException {
        
        // Get file metadata first for content type and name
        CloudStorageFile metadata = googleDriveService.getFileMetadata(fileId, authentication.getName());
        byte[] content = googleDriveService.downloadFile(fileId, authentication.getName());

        ByteArrayResource resource = new ByteArrayResource(content);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getName() + "\"")
                .contentType(MediaType.parseMediaType(metadata.getMimeType()))
                .contentLength(metadata.getSize())
                .body(resource);
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String fileId,
            Authentication authentication) throws IOException {
        googleDriveService.deleteFile(fileId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
