package com.koushik.soundcloud.dto.response;

import lombok.Data;
import lombok.Builder;
import java.util.UUID;

@Data
@Builder
public class TrackResponse {
    private UUID id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Integer year;
    private Long duration;
    private String format;
    private Long bitrate;
    private String fileId;
    private Long createdAt;
    private Long updatedAt;
}
