package com.koushik.soundcloud.service;

import com.koushik.soundcloud.entity.Track;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ITrackService {
    // Create
    Track uploadTrack(MultipartFile file, UUID userId) throws Exception;
    Track createTrack(Track track);
    
    // Read
    Optional<Track> getTrackById(UUID id);
    List<Track> getAllTracksByUserId(UUID userId);
    List<Track> searchTracks(UUID userId, String query);
    List<Track> getRecentTracks(UUID userId);
    
    // Update
    Track updateTrack(UUID id, Track track);
    
    // Delete
    void deleteTrack(UUID id);
    
    // Utilities
    boolean existsByFileIdAndUserId(String fileId, UUID userId);
    byte[] downloadTrack(UUID id) throws Exception;
}
