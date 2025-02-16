package com.koushik.soundcloud.controller;

import java.time.Duration;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import com.koushik.soundcloud.model.Playlist;
import com.koushik.soundcloud.service.PlaylistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    
    private final PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist(name, description, user.getUsername());
        return ResponseEntity.ok(playlist);
    }

    @PutMapping("/{playlistId}")
    public ResponseEntity<Playlist> updatePlaylist(
            @PathVariable String playlistId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean isPublic,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist(name, description, user.getUsername()); // Simulated, should fetch from DB
        playlistService.updatePlaylist(playlist, name, description, isPublic);
        return ResponseEntity.ok(playlist);
    }

    @PostMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<Void> addTrackToPlaylist(
            @PathVariable String playlistId,
            @PathVariable String trackId,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist("", "", user.getUsername()); // Simulated, should fetch from DB
        playlistService.addTrackToPlaylist(playlist, trackId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<Void> removeTrackFromPlaylist(
            @PathVariable String playlistId,
            @PathVariable String trackId,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist("", "", user.getUsername()); // Simulated, should fetch from DB
        playlistService.removeTrackFromPlaylist(playlist, trackId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{playlistId}/share")
    public ResponseEntity<String> sharePlaylist(
            @PathVariable String playlistId,
            @RequestParam(required = false, defaultValue = "24") Integer expiryHours,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist("", "", user.getUsername()); // Simulated, should fetch from DB
        String shareToken = playlistService.generateShareToken(playlist, Duration.ofHours(expiryHours));
        return ResponseEntity.ok(shareToken);
    }

    @DeleteMapping("/{playlistId}/share")
    public ResponseEntity<Void> revokeShare(
            @PathVariable String playlistId,
            @AuthenticationPrincipal User user) {
        Playlist playlist = playlistService.createPlaylist("", "", user.getUsername()); // Simulated, should fetch from DB
        playlistService.revokeShare(playlist);
        return ResponseEntity.ok().build();
    }
} 