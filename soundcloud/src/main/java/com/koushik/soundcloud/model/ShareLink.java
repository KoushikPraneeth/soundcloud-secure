package com.koushik.soundcloud.model;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShareLink {
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    
    private String userId;
    private String fileId;
    private String token;
    private LocalDateTime expiresAt;
    private ShareLinkAccessType accessType;
    private ShareLinkStatus status;
    private CloudStorageProvider provider;
}
