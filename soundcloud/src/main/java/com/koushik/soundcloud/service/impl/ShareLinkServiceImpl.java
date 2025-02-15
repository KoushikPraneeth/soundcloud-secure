package com.koushik.soundcloud.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.ShareLink;
import com.koushik.soundcloud.model.ShareLinkAccessType;
import com.koushik.soundcloud.model.ShareLinkStatus;
import com.koushik.soundcloud.service.CloudStorageService;
import com.koushik.soundcloud.service.ShareLinkService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShareLinkServiceImpl implements ShareLinkService {

    private static final Logger log = LoggerFactory.getLogger(ShareLinkServiceImpl.class);

    // In-memory storage for share links (replace with database in production)
    private final Map<String, ShareLink> shareLinks = new ConcurrentHashMap<>();
    private final Map<String, String> tokenToLinkId = new ConcurrentHashMap<>();
    
    private final CloudStorageService cloudStorageService;

    @Override
    public ShareLink createShareLink(String userId, String fileId, ShareLinkAccessType accessType, Integer expirationHours) {
        // Verify the file exists and user has access
        var file = cloudStorageService.getFile(userId, fileId);
        
        // Generate a unique token
        String token = UUID.randomUUID().toString();
        
        // Calculate expiration time if provided
        LocalDateTime expiresAt = expirationHours != null 
            ? LocalDateTime.now().plusHours(expirationHours)
            : null;
            
        // Create the share link
        ShareLink shareLink = ShareLink.builder()
            .userId(userId)
            .fileId(fileId)
            .token(token)
            .expiresAt(expiresAt)
            .accessType(accessType)
            .status(ShareLinkStatus.ACTIVE)
            .provider(file.getProvider())
            .build();
            
        // Store the share link
        shareLinks.put(shareLink.getId(), shareLink);
        tokenToLinkId.put(token, shareLink.getId());
        
        log.info("Created share link {} for file {} by user {}", shareLink.getId(), fileId, userId);
        return shareLink;
    }

    @Override
    public List<ShareLink> listShareLinks(String userId) {
        return shareLinks.values().stream()
            .filter(link -> link.getUserId().equals(userId))
            .filter(link -> link.getStatus() == ShareLinkStatus.ACTIVE)
            .toList();
    }

    @Override
    public ShareLink getShareLink(String userId, String linkId) {
        ShareLink link = shareLinks.get(linkId);
        if (link != null && link.getUserId().equals(userId)) {
            return link;
        }
        return null;
    }

    @Override
    public void revokeShareLink(String userId, String linkId) {
        ShareLink link = shareLinks.get(linkId);
        if (link != null && link.getUserId().equals(userId)) {
            link.setStatus(ShareLinkStatus.REVOKED);
            log.info("Revoked share link {} by user {}", linkId, userId);
        }
    }

    @Override
    public ShareLink validateShareLinkToken(String token) {
        String linkId = tokenToLinkId.get(token);
        if (linkId == null) {
            return null;
        }
        
        ShareLink link = shareLinks.get(linkId);
        if (link == null) {
            return null;
        }
        
        // Check if link is active
        if (link.getStatus() != ShareLinkStatus.ACTIVE) {
            return null;
        }
        
        // Check if link has expired
        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            link.setStatus(ShareLinkStatus.EXPIRED);
            return null;
        }
        
        return link;
    }
}
