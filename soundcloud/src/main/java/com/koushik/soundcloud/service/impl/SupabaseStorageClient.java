package com.koushik.soundcloud.service.impl;

import com.koushik.soundcloud.config.SupabaseProperties;
import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.exception.CloudStorageException;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupabaseStorageClient {
    private final RestTemplate restTemplate;
    private final SupabaseProperties properties;

    public CloudStorageFile uploadFile(MultipartFile file, String path) {
        try {
            String url = String.format("%s/storage/v1/object/%s/%s",
                    properties.getSupabaseUrl(),
                    properties.getStorageBucketName(),
                    path);

            // Create headers
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Create the multipart request body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);

            // Create the request entity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Make the request
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> fileData = response.getBody();
                return CloudStorageFile.builder()
                        .id(path)
                        .name(file.getOriginalFilename())
                        .mimeType(file.getContentType())
                        .size(file.getSize())
                        .downloadUrl(getDownloadUrl(path))
                        .provider(CloudStorageProvider.SUPABASE)
                        .build();
            } else {
                throw new CloudStorageException("Failed to upload file to Supabase Storage");
            }
        } catch (IOException e) {
            throw new CloudStorageException("Failed to read file contents", e);
        }
    }

    public void deleteFile(String path) {
        String url = String.format("%s/storage/v1/object/%s/%s",
                properties.getSupabaseUrl(),
                properties.getStorageBucketName(),
                path);

        HttpHeaders headers = createHeaders();
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                url,
                HttpMethod.DELETE,
                requestEntity,
                Void.class
        );

        if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.NO_CONTENT) {
            throw new CloudStorageException("Failed to delete file from Supabase Storage");
        }
    }

    public byte[] downloadFile(String path) {
        String url = String.format("%s/storage/v1/object/%s/%s",
                properties.getSupabaseUrl(),
                properties.getStorageBucketName(),
                path);

        HttpHeaders headers = createHeaders();
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                byte[].class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new CloudStorageException("Failed to download file from Supabase Storage");
        }
    }

    public String getSignedUrl(String path, Long expiresIn) {
        String url = String.format("%s/storage/v1/object/sign/%s/%s",
                properties.getSupabaseUrl(),
                properties.getStorageBucketName(),
                path);

        HttpHeaders headers = createHeaders();
        Map<String, Object> body = new HashMap<>();
        body.put("expiresIn", expiresIn);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return (String) response.getBody().get("signedUrl");
        } else {
            throw new CloudStorageException("Failed to get signed URL from Supabase Storage");
        }
    }

    public List<CloudStorageFile> listFiles(String prefix) {
        String url = String.format("%s/storage/v1/object/list/%s",
                properties.getSupabaseUrl(),
                properties.getStorageBucketName());

        HttpHeaders headers = createHeaders();
        Map<String, Object> body = new HashMap<>();
        body.put("prefix", prefix);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().stream()
                    .map(this::mapToCloudStorageFile)
                    .collect(Collectors.toList());
        } else {
            throw new CloudStorageException("Failed to list files from Supabase Storage");
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + properties.getSupabaseAnonKey());
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @SuppressWarnings("unchecked")
    private CloudStorageFile mapToCloudStorageFile(Map<String, Object> fileData) {
        String path = (String) fileData.get("name");
        String name = path.substring(path.lastIndexOf('/') + 1);
        
        Map<String, Object> metadata = (Map<String, Object>) fileData.get("metadata");
        String mimeType = metadata != null ? (String) metadata.get("mimetype") : "application/octet-stream";
        Long size = metadata != null ? Long.parseLong(String.valueOf(metadata.get("size"))) : 0L;

        return CloudStorageFile.builder()
                .id(path)
                .name(name)
                .mimeType(mimeType)
                .size(size)
                .downloadUrl(getDownloadUrl(path))
                .provider(CloudStorageProvider.SUPABASE)
                .build();
    }

    private String getDownloadUrl(String path) {
        return String.format("%s/storage/v1/object/public/%s/%s",
                properties.getSupabaseUrl(),
                properties.getStorageBucketName(),
                path);
    }
}
