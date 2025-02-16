package com.koushik.soundcloud.service;

import java.time.Duration;
import java.util.UUID;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.exception.CloudStorageException;
import com.koushik.soundcloud.repository.TrackRepository;
import com.koushik.soundcloud.repository.UserPreferencesRepository;
import com.koushik.soundcloud.service.EncryptionService;
import com.koushik.soundcloud.dto.response.EncryptionResult;
import com.koushik.soundcloud.service.impl.ByteArrayMultipartFile;
import com.koushik.soundcloud.service.impl.SupabaseStorageClient;
import com.koushik.soundcloud.model.CloudStorageFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {
    private final TrackRepository trackRepository;
    private final EncryptionService encryptionService;
    private final UserPreferencesRepository userPreferencesRepository;
    private final SupabaseStorageClient supabaseStorageClient;
    private final Tika tika = new Tika();

    @Transactional
    public Track uploadFile(MultipartFile file, UUID userId, String title) throws Exception {
        String fileId = UUID.randomUUID().toString();
        String contentType = tika.detect(file.getBytes());
        
        if (!contentType.startsWith("audio/")) {
            throw new CloudStorageException("File must be an audio file");
        }
        
        byte[] fileContent;
        String encryptionKey = null;
        String iv = null;
        
        if (shouldEncryptFile(userId)) {
            encryptionKey = encryptionService.generateKey();
            iv = encryptionService.generateIv();
            EncryptionResult encryptedData = encryptionService.encrypt(file.getBytes(), encryptionKey, iv);
            fileContent = encryptedData.getData();
        } else {
            fileContent = file.getBytes();
        }

        try {
            CloudStorageFile uploadedFile = supabaseStorageClient.uploadFile(
                new ByteArrayMultipartFile(fileContent, file.getOriginalFilename(), contentType), 
                fileId
            );

            Track track = Track.builder()
                .title(title)
                .fileId(fileId)
                .userId(userId)
                .storageUrl(uploadedFile.getDownloadUrl())
                .format(contentType)
                .encryptionKey(encryptionKey)
                .iv(iv)
                .build();
            
            return trackRepository.save(track);
            
        } catch (Exception e) {
            log.error("Failed to upload file to Supabase Storage", e);
            throw new CloudStorageException("Failed to upload file: " + e.getMessage());
        }
    }

    public byte[] downloadFile(UUID id, UUID userId) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found"));

        byte[] downloadedData = supabaseStorageClient.downloadFile(track.getFileId());
            
        if (track.getEncryptionKey() != null && track.getIv() != null) {
            return encryptionService.decrypt(
                downloadedData,
                track.getEncryptionKey(),
                track.getIv()
            );
        }
        
        return downloadedData;
    }

    @Transactional
    public void deleteFile(UUID id, UUID userId) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found"));
            
        if (!track.getUserId().equals(userId)) {
            throw new CloudStorageException("Not authorized to delete this file");
        }

        try {
            supabaseStorageClient.deleteFile(track.getFileId());
            trackRepository.delete(track);
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase Storage", e);
            throw new CloudStorageException("Failed to delete file: " + e.getMessage());
        }
    }

    public String getSignedUrl(UUID id, Duration duration, UUID userId) throws Exception {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new CloudStorageException("Track not found"));
            
        return supabaseStorageClient.getSignedUrl(track.getFileId(), duration.toSeconds());
    }

    private boolean shouldEncryptFile(UUID userId) {
        return userPreferencesRepository.isEncryptionEnabled(userId);
    }
}
