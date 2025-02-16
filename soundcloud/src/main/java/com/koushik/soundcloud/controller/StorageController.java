package com.koushik.soundcloud.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.dto.request.UpdateCloudStorageRequest;
import com.koushik.soundcloud.dto.request.UpdateUserPreferencesRequest;
import com.koushik.soundcloud.dto.request.UploadTrackRequest;
import com.koushik.soundcloud.dto.response.ApiResponse;
import com.koushik.soundcloud.dto.response.TrackResponse;
import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.entity.UserPreferences;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.service.StorageService;
import com.koushik.soundcloud.service.UserPreferencesService;
import com.koushik.soundcloud.utils.TrackMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.Duration;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@Tag(name = "Storage", description = "Storage and user preferences management endpoints")
public class StorageController {

    private final StorageService storageService;
    private final UserPreferencesService userPreferencesService;
    private final TrackMapper trackMapper;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload a file to storage")
    public ResponseEntity<ApiResponse<TrackResponse>> uploadFile(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file,
            @Valid UploadTrackRequest uploadRequest) throws Exception {
        Track track = storageService.uploadFile(file, userId, uploadRequest.getTitle());
        TrackResponse trackResponse = trackMapper.toDto(track);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(trackResponse));
    }

    @GetMapping("/download/{fileId}")
    @Operation(summary = "Download a file from storage")
    public ResponseEntity<byte[]> downloadFile(
            @AuthenticationPrincipal String userId,
            @PathVariable String fileId) throws Exception {
        byte[] fileContent = storageService.downloadFile(fileId, userId);
        return ResponseEntity.ok(fileContent);
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete a file from storage")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @AuthenticationPrincipal String userId,
            @PathVariable String fileId) throws Exception {
        storageService.deleteFile(fileId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/signed-url/{fileId}")
    @Operation(summary = "Get a signed URL for file access")
    public ResponseEntity<ApiResponse<String>> getSignedUrl(
            @AuthenticationPrincipal String userId,
            @PathVariable String fileId,
            @RequestParam(defaultValue = "3600") Long expirationSeconds) throws Exception {
        String url = storageService.getSignedUrl(fileId, Duration.ofSeconds(expirationSeconds), userId);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Get user preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> getUserPreferences(
            @AuthenticationPrincipal String userId) {
        UserPreferences preferences = userPreferencesService.getUserPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(preferences));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update user preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> updatePreferences(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateUserPreferencesRequest preferencesRequest) {
        UserPreferences preferences = userPreferencesService.updatePreferences(
            userId,
            preferencesRequest.getDefaultPrivacy(),
            preferencesRequest.getEnableEncryption(),
            preferencesRequest.getTheme(),
            preferencesRequest.getQualityPreference(),
            preferencesRequest.getAutoSyncEnabled()
        );
        return ResponseEntity.ok(ApiResponse.success(preferences));
    }

    @PutMapping("/preferences/cloud-storage")
    @Operation(summary = "Update cloud storage settings")
    public ResponseEntity<ApiResponse<UserPreferences>> updateCloudStorageSettings(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateCloudStorageRequest cloudStorageRequest) {
        UserPreferences preferences = userPreferencesService.updateCloudStorageSettings(
            userId,
            cloudStorageRequest.getProvider(),
            cloudStorageRequest.getAccessToken(),
            cloudStorageRequest.getRefreshToken(),
            cloudStorageRequest.getFolderId()
        );
        return ResponseEntity.ok(ApiResponse.success(preferences));
    }
}
