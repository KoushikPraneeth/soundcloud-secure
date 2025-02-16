package com.koushik.soundcloud.entity;

import com.koushik.soundcloud.model.CloudStorageProvider;
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
    
    @Column(name = "enable_encryption")
    @Builder.Default
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
    @Builder.Default
    private String theme = "light";
    
    @Column(name = "quality_preference")
    @Builder.Default
    private String qualityPreference = "high";
    
    @Column(name = "auto_sync_enabled")
    @Builder.Default
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
