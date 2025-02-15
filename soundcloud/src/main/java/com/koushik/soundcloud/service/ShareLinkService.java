package com.koushik.soundcloud.service;

import java.util.List;

import com.koushik.soundcloud.model.ShareLink;
import com.koushik.soundcloud.model.ShareLinkAccessType;

public interface ShareLinkService {
    /**
     * Create a new share link
     * @param userId Creator's user ID
     * @param fileId File ID to share
     * @param accessType Type of access to grant
     * @param expirationHours Number of hours until expiration (null for no expiration)
     * @return Created share link
     */
    ShareLink createShareLink(String userId, String fileId, ShareLinkAccessType accessType, Integer expirationHours);

    /**
     * List all active share links for a user
     * @param userId User ID
     * @return List of share links
     */
    List<ShareLink> listShareLinks(String userId);

    /**
     * Get a specific share link
     * @param userId User ID
     * @param linkId Share link ID
     * @return Share link if found and owned by user
     */
    ShareLink getShareLink(String userId, String linkId);

    /**
     * Revoke a share link
     * @param userId User ID
     * @param linkId Share link ID
     */
    void revokeShareLink(String userId, String linkId);

    /**
     * Validate a share link token
     * @param token Share link token
     * @return Share link if valid, null if expired or revoked
     */
    ShareLink validateShareLinkToken(String token);
}
