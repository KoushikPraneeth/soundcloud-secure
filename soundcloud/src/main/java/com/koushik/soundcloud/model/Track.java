package com.koushik.soundcloud.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Track {
    private String id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Integer year;
    private Long duration;
    private String fileId;
    private String userId;
    private String storageUrl;
    private String format;
    private Long bitrate;
    private String encryptionKey;
    private String iv;
    private Long createdAt;
    private Long updatedAt;
} 