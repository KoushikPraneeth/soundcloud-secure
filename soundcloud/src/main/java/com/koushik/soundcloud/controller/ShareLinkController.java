package com.koushik.soundcloud.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koushik.soundcloud.model.ShareLink;
import com.koushik.soundcloud.model.request.CreateShareLinkRequest;
import com.koushik.soundcloud.service.ShareLinkService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/share-links")
@RequiredArgsConstructor
@Tag(name = "Share Links", description = "API endpoints for managing share links")
@SecurityRequirement(name = "bearerAuth")
public class ShareLinkController {

    private final ShareLinkService shareLinkService;

    @PostMapping
    @Operation(summary = "Create share link", description = "Create a new share link for a file")
    public ResponseEntity<ShareLink> createShareLink(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateShareLinkRequest request) {
        ShareLink shareLink = shareLinkService.createShareLink(
            userId,
            request.getFileId(),
            request.getAccessType(),
            request.getExpirationHours()
        );
        return ResponseEntity.ok(shareLink);
    }

    @GetMapping
    @Operation(summary = "List share links", description = "List all active share links for the authenticated user")
    public ResponseEntity<List<ShareLink>> listShareLinks(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(shareLinkService.listShareLinks(userId));
    }

    @GetMapping("/{linkId}")
    @Operation(summary = "Get share link", description = "Get details of a specific share link")
    public ResponseEntity<ShareLink> getShareLink(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the share link")
            @PathVariable String linkId) {
        ShareLink shareLink = shareLinkService.getShareLink(userId, linkId);
        return shareLink != null
            ? ResponseEntity.ok(shareLink)
            : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{linkId}")
    @Operation(summary = "Revoke share link", description = "Revoke an active share link")
    public ResponseEntity<Void> revokeShareLink(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the share link to revoke")
            @PathVariable String linkId) {
        shareLinkService.revokeShareLink(userId, linkId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate/{token}")
    @Operation(summary = "Validate token", description = "Validate a share link token")
    public ResponseEntity<ShareLink> validateToken(
            @Parameter(description = "Share link token to validate")
            @PathVariable String token) {
        ShareLink shareLink = shareLinkService.validateShareLinkToken(token);
        return shareLink != null
            ? ResponseEntity.ok(shareLink)
            : ResponseEntity.notFound().build();
    }
}
