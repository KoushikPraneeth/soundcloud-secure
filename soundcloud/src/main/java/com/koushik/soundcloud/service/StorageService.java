package com.koushik.soundcloud.service;

import java.io.InputStream;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.koushik.soundcloud.entity.Track;
import com.koushik.soundcloud.exception.CloudStorageException;
import com.koushik.soundcloud.repository.TrackRepository;
import com.koushik.soundcloud.repository.UserPreferencesRepository;
import com.koushik.soundcloud.service.EncryptionService;

import io.supabase.client.StorageClient;
import io.supabase.client.StorageFileApi;
import io.supabase.client.SupabaseClient;
import io.supabase.client.SupabaseClientBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.bucket}")
    private String bucketName;

    private final TrackRepository trackRepository;
    private final EncryptionService encryptionService;
    private final UserPreferencesRepository userPreferencesRepository;
    private final Tika tika = new Tika();

    private SupabaseClient getClient() {
        return new SupabaseClientBuilder(supabaseUrl, supabaseKey).build();
    }

    @Transactional
    public Track uploadFile(MultipartFile file, String userId, String title) throws Exception {
        String fileId = UUID.randomUUID().toString();
        String contentType = tika.detect(file.getInputStream());
        
        if (!contentType.startsWith("audio/")) {
            throw new CloudStorageException("File must be an audio file");
        }
        
        StorageClient storageClient = getClient().getStorage();
        StorageFileApi bucket = storageClient.from(bucketName);

        // Encrypt file content if needed
        InputStream fileContent;
        String encryptionKey = null;
        String iv = null;
        
        if (shouldEncryptFile(userId)) {
            var encryptedData = encryptionService.encrypt(file.getInputStream());
            fileContent = encryptedData.getInputStream();
            encryptionKey = encryptedData.getKey();
            iv = encryptedData.getIv();
        } else {
            fileContent = file.getInputStream();
        }

        Map<String, String> fileOptions = new HashMap<>();
        fileOptions.put("contentType", contentType);

        try {
            bucket.upload(fileId, fileContent, contentType, fileOptions);
            String storageUrl = bucket.getSignedUrl(fileId, 60 * 60 * 24); // 24 hour signed URL

            Track track = Track.builder()
                .title(title)
                .fileId(fileId)
                .userId(userId)
                .storageUrl(storageUrl)
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

    public byte[] downloadFile(String fileId, String userId) throws Exception {
        StorageClient storageClient = getClient().getStorage();
        StorageFileApi bucket = storageClient.from(bucketName);

        byte[] encryptedData = bucket.download(fileId, null);

        Track track = trackRepository.findById(fileId)
            .orElseThrow(() -> new CloudStorageException("Track not found"));
            
        if (track.getEncryptionKey() != null && track.getIv() != null) {
            return encryptionService.decrypt(
                encryptedData,
                track.getEncryptionKey(),
                track.getIv()
            );
        }
        
        return encryptedData;
    }

    @Transactional
    public void deleteFile(String fileId, String userId) throws Exception {
        Track track = trackRepository.findById(fileId)
            .orElseThrow(() -> new CloudStorageException("Track not found"));
            
        if (!track.getUserId().equals(userId)) {
            throw new CloudStorageException("Not authorized to delete this file");
        }
        
        StorageClient storageClient = getClient().getStorage();
        StorageFileApi bucket = storageClient.from(bucketName);

        try {
            bucket.remove(fileId);
            trackRepository.delete(track);
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase Storage", e);
            throw new CloudStorageException("Failed to delete file: " + e.getMessage());
        }
    }

    public String getSignedUrl(String fileId, Duration duration, String userId) throws Exception {
        Track track = trackRepository.findById(fileId)
            .orElseThrow(() -> new CloudStorageException("Track not found"));
            
        StorageClient storageClient = getClient().getStorage();
        StorageFileApi bucket = storageClient.from(bucketName);

        return bucket.getSignedUrl(fileId, duration.toSeconds().intValue());
    }

    private boolean shouldEncryptFile(String userId) {
        return userPreferencesRepository.isEncryptionEnabled(userId);
    }
}
