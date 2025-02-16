package com.koushik.soundcloud.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.koushik.soundcloud.model.CloudStorageProvider;

@Data
public class UpdateCloudStorageRequest {
    
    @NotNull(message = "Cloud storage provider is required")
    private CloudStorageProvider provider;
    
    @NotBlank(message = "Access token is required")
    private String accessToken;
    
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
    
    @NotBlank(message = "Folder ID is required")
    private String folderId;
}
