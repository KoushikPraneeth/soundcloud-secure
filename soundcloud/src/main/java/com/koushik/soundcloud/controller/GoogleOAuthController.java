package com.koushik.soundcloud.controller;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;

@RestController
@RequestMapping("/oauth2/google")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleAuthorizationCodeFlow flow;

    @GetMapping("/authorize")
    public ResponseEntity<String> authorize() {
        AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl()
                .setAccessType("offline")
                .setApprovalPrompt("force");
        
        return ResponseEntity.ok(authorizationUrl.build());
    }

    @GetMapping("/callback")
    public RedirectView callback(@RequestParam("code") String code, Authentication authentication) {
        try {
            String userId = authentication.getName();
            TokenResponse response = flow.newTokenRequest(code)
                    .setGrantType("authorization_code")
                    .execute();
            
            flow.createAndStoreCredential(response, userId);
            
            // Redirect to frontend dashboard with success
            return new RedirectView("/dashboard?connection=success");
        } catch (IOException e) {
            // Redirect to frontend with error
            return new RedirectView("/dashboard?connection=error");
        }
    }

    @GetMapping("/revoke")
    public ResponseEntity<Void> revokeAccess(Authentication authentication) {
        try {
            String userId = authentication.getName();
            flow.getCredentialDataStore().delete(userId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> checkConnectionStatus(Authentication authentication) {
        try {
            String userId = authentication.getName();
            return ResponseEntity.ok(flow.getCredentialDataStore().get(userId) != null);
        } catch (IOException e) {
            return ResponseEntity.ok(false);
        }
    }
}
