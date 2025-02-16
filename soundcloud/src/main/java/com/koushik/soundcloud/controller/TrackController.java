package com.koushik.soundcloud.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.model.Track;
import com.koushik.soundcloud.service.TrackService;
import com.koushik.soundcloud.service.StorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
public class TrackController {
    
    private final TrackService trackService;
    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<Track> uploadTrack(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws Exception {
        Track track = trackService.uploadTrack(file, user.getUsername());
        return ResponseEntity.ok(track);
    }

    @GetMapping("/{trackId}/download")
    public ResponseEntity<byte[]> downloadTrack(
            @PathVariable String trackId,
            @AuthenticationPrincipal User user) throws Exception {
        byte[] data = storageService.downloadFile(trackId);
        return ResponseEntity.ok()
                .header("Content-Type", "audio/mpeg")
                .body(data);
    }

    @DeleteMapping("/{trackId}")
    public ResponseEntity<Void> deleteTrack(
            @PathVariable String trackId,
            @AuthenticationPrincipal User user) throws Exception {
        storageService.deleteFile(trackId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{trackId}/stream")
    public ResponseEntity<String> getStreamUrl(
            @PathVariable String trackId,
            @AuthenticationPrincipal User user) throws Exception {
        String url = storageService.getSignedUrl(trackId, java.time.Duration.ofHours(1));
        return ResponseEntity.ok(url);
    }
} 