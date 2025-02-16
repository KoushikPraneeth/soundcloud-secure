package com.koushik.soundcloud.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.koushik.soundcloud.model.Playlist;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    
    private final StorageService storageService;

    public Playlist createPlaylist(String name, String description, String userId) {
        return Playlist.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .description(description)
                .userId(userId)
                .trackIds(new ArrayList<>())
                .isPublic(false)
                .createdAt(System.currentTimeMillis())
                .updatedAt(System.currentTimeMillis())
                .build();
    }

    public void addTrackToPlaylist(Playlist playlist, String trackId) {
        if (playlist.getTrackIds() == null) {
            playlist.setTrackIds(new ArrayList<>());
        }
        playlist.getTrackIds().add(trackId);
        playlist.setUpdatedAt(System.currentTimeMillis());
    }

    public void removeTrackFromPlaylist(Playlist playlist, String trackId) {
        if (playlist.getTrackIds() != null) {
            playlist.getTrackIds().remove(trackId);
            playlist.setUpdatedAt(System.currentTimeMillis());
        }
    }

    public String generateShareToken(Playlist playlist, Duration expiry) {
        String shareToken = UUID.randomUUID().toString();
        playlist.setShareToken(shareToken);
        playlist.setShareExpiry(System.currentTimeMillis() + expiry.toMillis());
        playlist.setUpdatedAt(System.currentTimeMillis());
        return shareToken;
    }

    public void revokeShare(Playlist playlist) {
        playlist.setShareToken(null);
        playlist.setShareExpiry(null);
        playlist.setUpdatedAt(System.currentTimeMillis());
    }

    public boolean isShareValid(Playlist playlist) {
        return playlist.getShareToken() != null && 
               playlist.getShareExpiry() != null && 
               playlist.getShareExpiry() > System.currentTimeMillis();
    }

    public void updatePlaylist(Playlist playlist, String name, String description, Boolean isPublic) {
        if (name != null) playlist.setName(name);
        if (description != null) playlist.setDescription(description);
        if (isPublic != null) playlist.setIsPublic(isPublic);
        playlist.setUpdatedAt(System.currentTimeMillis());
    }
} 