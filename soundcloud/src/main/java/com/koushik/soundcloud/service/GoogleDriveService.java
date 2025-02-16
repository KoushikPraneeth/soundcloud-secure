package com.koushik.soundcloud.service;

import com.koushik.soundcloud.model.CloudStorageFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface GoogleDriveService {
    /**
     * Upload a file to Google Drive
     * @param file The file to upload
     * @param userId The ID of the user uploading the file
     * @return The uploaded file details
     */
    CloudStorageFile uploadFile(MultipartFile file, String userId) throws IOException;

    /**
     * Download a file from Google Drive
     * @param fileId The ID of the file to download
     * @param userId The ID of the user requesting the download
     * @return The file bytes
     */
    byte[] downloadFile(String fileId, String userId) throws IOException;

    /**
     * List files for a user
     * @param userId The ID of the user
     * @return List of files
     */
    List<CloudStorageFile> listFiles(String userId) throws IOException;

    /**
     * Delete a file from Google Drive
     * @param fileId The ID of the file to delete
     * @param userId The ID of the user requesting deletion
     */
    void deleteFile(String fileId, String userId) throws IOException;

    /**
     * Get metadata for a file
     * @param fileId The ID of the file
     * @param userId The ID of the user requesting the metadata
     * @return The file metadata
     */
    CloudStorageFile getFileMetadata(String fileId, String userId) throws IOException;
}
