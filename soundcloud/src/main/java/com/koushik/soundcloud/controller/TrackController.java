package com.koushik.soundcloud.controller;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.service.ITrackService;
import com.koushik.soundcloud.service.StorageService;
import com.koushik.soundcloud.dto.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
public class TrackController {
    
    private final ITrackService trackService;
    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Track>> uploadTrack(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @AuthenticationPrincipal User user) throws Exception {
        Track track = storageService.uploadFile(file, UUID.fromString(user.getUsername()), title);
        return ResponseEntity.ok(new ApiResponse<>(true, "Track uploaded successfully", track));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Track>>> getAllTracks(@AuthenticationPrincipal User user) {
        List<Track> tracks = trackService.getAllTracksByUserId(UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(new ApiResponse<>(true, "Tracks retrieved successfully", tracks));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Track>>> getRecentTracks(@AuthenticationPrincipal User user) {
        List<Track> tracks = trackService.getRecentTracks(UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(new ApiResponse<>(true, "Recent tracks retrieved successfully", tracks));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Track>>> searchTracks(
            @RequestParam String query,
            @AuthenticationPrincipal User user) {
        List<Track> tracks = trackService.searchTracks(UUID.fromString(user.getUsername()), query);
        return ResponseEntity.ok(new ApiResponse<>(true, "Search results retrieved", tracks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Track>> getTrack(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return trackService.getTrackById(id)
                .map(track -> ResponseEntity.ok(new ApiResponse<>(true, "Track retrieved successfully", track)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Track not found", null)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadTrack(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) throws Exception {
        byte[] data = storageService.downloadFile(id, UUID.fromString(user.getUsername()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(data);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Track>> updateTrack(
            @PathVariable UUID id,
            @RequestBody Track track,
            @AuthenticationPrincipal User user) {
        track.setId(id); // Ensure ID matches path variable
        Track updatedTrack = trackService.updateTrack(id, track);
        return ResponseEntity.ok(new ApiResponse<>(true, "Track updated successfully", updatedTrack));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrack(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) throws Exception {
        storageService.deleteFile(id, UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(new ApiResponse<>(true, "Track deleted successfully", null));
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<ApiResponse<String>> getStreamUrl(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) throws Exception {
        String url = storageService.getSignedUrl(id, Duration.ofHours(1), UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(new ApiResponse<>(true, "Stream URL generated", url));
    }
}
