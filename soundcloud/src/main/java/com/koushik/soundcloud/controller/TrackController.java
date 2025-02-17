package com.koushik.soundcloud.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.service.ITrackService;
import com.koushik.soundcloud.service.GoogleDriveService;
import com.koushik.soundcloud.dto.response.ApiResponse;
import com.koushik.soundcloud.dto.response.TrackResponse;
import com.koushik.soundcloud.utils.TrackMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
public class TrackController {
    
    private final ITrackService trackService;
    private final GoogleDriveService googleDriveService;
    private final TrackMapper trackMapper;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<TrackResponse>> uploadTrack(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @AuthenticationPrincipal User user) throws Exception {
        Track track = trackService.uploadTrack(file, UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(ApiResponse.<TrackResponse>builder()
            .success(true)
            .message("Track uploaded successfully")
            .data(trackMapper.toDto(track))
            .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrackResponse>>> getAllTracks(@AuthenticationPrincipal User user) {
        List<TrackResponse> tracks = trackService.getAllTracksByUserId(UUID.fromString(user.getUsername()))
            .stream()
            .map(trackMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<TrackResponse>>builder()
            .success(true)
            .message("Tracks retrieved successfully")
            .data(tracks)
            .build());
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<TrackResponse>>> getRecentTracks(@AuthenticationPrincipal User user) {
        List<TrackResponse> tracks = trackService.getRecentTracks(UUID.fromString(user.getUsername()))
            .stream()
            .map(trackMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<TrackResponse>>builder()
            .success(true)
            .message("Recent tracks retrieved successfully")
            .data(tracks)
            .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TrackResponse>>> searchTracks(
            @RequestParam String query,
            @AuthenticationPrincipal User user) {
        List<TrackResponse> tracks = trackService.searchTracks(UUID.fromString(user.getUsername()), query)
            .stream()
            .map(trackMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<TrackResponse>>builder()
            .success(true)
            .message("Search results retrieved")
            .data(tracks)
            .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrackResponse>> getTrack(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return trackService.getTrackById(id)
                .map(track -> ResponseEntity.ok(ApiResponse.<TrackResponse>builder()
                    .success(true)
                    .message("Track retrieved successfully")
                    .data(trackMapper.toDto(track))
                    .build()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<TrackResponse>builder()
                            .success(false)
                            .message("Track not found")
                            .data(null)
                            .build()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrackResponse>> updateTrack(
            @PathVariable UUID id,
            @RequestBody Track track,
            @AuthenticationPrincipal User user) {
        track.setId(id);
        Track updatedTrack = trackService.updateTrack(id, track);
        return ResponseEntity.ok(ApiResponse.<TrackResponse>builder()
            .success(true)
            .message("Track updated successfully")
            .data(trackMapper.toDto(updatedTrack))
            .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrack(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) throws Exception {
        Track track = trackService.getTrackById(id)
            .orElseThrow(() -> new IllegalArgumentException("Track not found"));
        googleDriveService.deleteFile(track.getFileId(), user.getUsername());
        trackService.deleteTrack(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
            .success(true)
            .message("Track deleted successfully")
            .data(null)
            .build());
    }
}
