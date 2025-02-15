package com.koushik.soundcloud.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.service.CloudStorageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cloud")
@RequiredArgsConstructor
@Tag(name = "Cloud Storage", description = "API endpoints for cloud storage operations")
@SecurityRequirement(name = "bearerAuth")
public class CloudStorageController {

    private final CloudStorageService cloudStorageService;

    @GetMapping("/files")
    @Operation(summary = "List files", description = "List files from the cloud storage")
    public ResponseEntity<List<CloudStorageFile>> listFiles(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Path to list files from (optional)")
            @RequestParam(required = false) String path) {
        return ResponseEntity.ok(cloudStorageService.listFiles(userId, path));
    }

    @GetMapping("/files/{fileId}")
    @Operation(summary = "Get file details", description = "Get metadata for a specific file")
    public ResponseEntity<CloudStorageFile> getFile(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the file to retrieve")
            @PathVariable String fileId) {
        return ResponseEntity.ok(cloudStorageService.getFile(userId, fileId));
    }

    @GetMapping("/files/{fileId}/download")
    @Operation(summary = "Get download URL", description = "Get a secure download URL for a file")
    public ResponseEntity<DownloadResponse> getDownloadUrl(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the file to download")
            @PathVariable String fileId) {
        String url = cloudStorageService.getDownloadUrl(userId, fileId);
        return ResponseEntity.ok(new DownloadResponse(url));
    }

    @GetMapping("/files/search")
    @Operation(summary = "Search files", description = "Search for files in the cloud storage")
    public ResponseEntity<List<CloudStorageFile>> searchFiles(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Search query")
            @RequestParam String query) {
        return ResponseEntity.ok(cloudStorageService.searchFiles(userId, query));
    }

    private record DownloadResponse(String downloadUrl) {}
}
