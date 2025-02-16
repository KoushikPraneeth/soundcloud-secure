package com.koushik.soundcloud.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "default_privacy")
    private boolean defaultPrivacy = false;
    
    @Column(name = "enable_encryption")
    private boolean enableEncryption = true;
    
    @Column(name = "cloud_storage_provider")
    @Enumerated(EnumType.STRING)
    private CloudStorageProvider cloudStorageProvider;
    
    @Column(name = "cloud_storage_folder_id")
    private String cloudStorageFolderId;
    
    @Column(name = "cloud_storage_access_token")
    private String cloudStorageAccessToken;
    
    @Column(name = "cloud_storage_refresh_token")
    private String cloudStorageRefreshToken;
    
    @Column(name = "theme")
    private String theme = "light";
    
    @Column(name = "quality_preference")
    private String qualityPreference = "high";
    
    @Column(name = "auto_sync_enabled")
    private boolean autoSyncEnabled = true;
    
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
