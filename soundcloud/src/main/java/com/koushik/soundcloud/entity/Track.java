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
@Table(name = "tracks")
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    private String artist;
    private String album;
    private String genre;
    private Integer year;
    private Long duration;
    
    @Column(name = "file_id", nullable = false)
    private String fileId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "storage_url")
    private String storageUrl;
    
    private String format;
    private Long bitrate;
    
    @Column(name = "encryption_key")
    private String encryptionKey;
    
    private String iv;
    
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
