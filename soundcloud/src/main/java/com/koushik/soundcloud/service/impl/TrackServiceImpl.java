package com.koushik.soundcloud.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.service.ITrackService;
import com.koushik.soundcloud.service.GoogleDriveService;
import com.koushik.soundcloud.repository.TrackRepository;
import com.koushik.soundcloud.exception.CloudStorageException;
import org.apache.tika.metadata.Metadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TrackServiceImpl implements ITrackService {

    private final TrackRepository trackRepository;
    private final GoogleDriveService googleDriveService;

    @Override
    public Track uploadTrack(MultipartFile file, UUID userId) throws Exception {
        // Upload to Google Drive and get cloud file info
        var cloudFile = googleDriveService.uploadFile(file, userId.toString());
        
        // Create track with basic file info
        Track track = Track.builder()
            .id(UUID.randomUUID())
            .title(file.getOriginalFilename())
            .fileId(cloudFile.getId())
            .userId(userId)
            .format(file.getContentType())
            .createdAt(System.currentTimeMillis())
            .updatedAt(System.currentTimeMillis())
            .build();

        return trackRepository.save(track);
    }
    
    @Override
    public Track createTrack(Track track) {
        return trackRepository.save(track);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Track> getTrackById(UUID id) {
        return trackRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Track> getAllTracksByUserId(UUID userId) {
        return trackRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Track> searchTracks(UUID userId, String query) {
        return trackRepository.searchTracks(userId, query);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Track> getRecentTracks(UUID userId) {
        return trackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Track updateTrack(UUID id, Track track) {
        return trackRepository.findById(id)
            .map(existingTrack -> {
                // Update mutable fields only
                existingTrack.setTitle(track.getTitle());
                existingTrack.setArtist(track.getArtist());
                existingTrack.setAlbum(track.getAlbum());
                existingTrack.setGenre(track.getGenre());
                existingTrack.setYear(track.getYear());
                return trackRepository.save(existingTrack);
            })
            .orElseThrow(() -> new CloudStorageException("Track not found with id: " + id));
    }

    @Override
    public void deleteTrack(UUID id) {
        trackRepository.findById(id)
            .ifPresent(track -> {
                try {
                    googleDriveService.deleteFile(track.getFileId(), track.getUserId().toString());
                } catch (Exception e) {
                    log.error("Failed to delete file from Google Drive", e);
                }
                trackRepository.delete(track);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByFileIdAndUserId(String fileId, UUID userId) {
        return trackRepository.existsByFileIdAndUserId(fileId, userId);
    }

    @Override
    public byte[] downloadTrack(UUID id) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found with id: " + id));
            
        return googleDriveService.downloadFile(track.getFileId(), track.getUserId().toString());
    }
}
