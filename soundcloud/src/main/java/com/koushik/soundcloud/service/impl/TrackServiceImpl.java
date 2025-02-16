package com.koushik.soundcloud.service.impl;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.service.ITrackService;
import com.koushik.soundcloud.service.EncryptionService;
import com.koushik.soundcloud.service.StorageService;
import com.koushik.soundcloud.repository.TrackRepository;
import com.koushik.soundcloud.dto.response.EncryptionResult;
import com.koushik.soundcloud.exception.CloudStorageException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TrackServiceImpl implements ITrackService {

    private final TrackRepository trackRepository;
    private final StorageService storageService;
    private final EncryptionService encryptionService;

    @Override
    public Track uploadTrack(MultipartFile file, UUID userId) throws Exception {
        // This method now delegates to StorageService
        return storageService.uploadFile(file, userId, file.getOriginalFilename());
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
    public void deleteTrack(UUID id) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found with id: " + id));
            
        storageService.deleteFile(id, track.getUserId());
    }

    @Override
    public byte[] downloadTrack(UUID id) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found with id: " + id));
            
        return storageService.downloadFile(id, track.getUserId());
    }
}
