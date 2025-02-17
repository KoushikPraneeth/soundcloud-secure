package com.koushik.soundcloud.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "default_privacy")
    @Builder.Default
    private boolean defaultPrivacy = false;
    
    @Column(name = "google_drive_folder_id")
    private String googleDriveFolderId;
    
    @Column(name = "google_drive_access_token")
    private String googleDriveAccessToken;
    
    @Column(name = "google_drive_refresh_token")
    private String googleDriveRefreshToken;
    
    @Column(name = "theme")
    @Builder.Default
    private String theme = "light";
    
    @Column(name = "quality_preference")
    @Builder.Default
    private String qualityPreference = "high";
    
    @Column(name = "created_at")
    private Long createdAt;
    
    @Column(name = "updated_at")
    private Long updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = System.currentTimeMillis();
        updatedAt = System.currentTimeMillis();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = System.currentTimeMillis();
    }
}
