package com.koushik.soundcloud.service;

import java.util.List;

import com.koushik.soundcloud.model.CloudStorageFile;

public interface CloudStorageService {
    /**
     * List files from the cloud storage provider
     * @param userId The authenticated user's ID
     * @param path Optional path to list files from (can be null for root)
     * @return List of files
     */
    List<CloudStorageFile> listFiles(String userId, String path);

    /**
     * Get a file's metadata
     * @param userId The authenticated user's ID
     * @param fileId The file's ID in the cloud storage
     * @return File metadata
     */
    CloudStorageFile getFile(String userId, String fileId);

    /**
     * Get a secure download URL for a file
     * @param userId The authenticated user's ID
     * @param fileId The file's ID in the cloud storage
     * @return Secure, temporary download URL
     */
    String getDownloadUrl(String userId, String fileId);

    /**
     * Search for files in the cloud storage
     * @param userId The authenticated user's ID
     * @param query Search query
     * @return List of matching files
     */
    List<CloudStorageFile> searchFiles(String userId, String query);
}
