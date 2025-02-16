package com.koushik.soundcloud.dto.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class TrackResponse {
    private String id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Integer year;
    private Long duration;
    private String format;
    private Long bitrate;
    private String storageUrl;
    private boolean isEncrypted;
    private Long createdAt;
    private Long updatedAt;
}
