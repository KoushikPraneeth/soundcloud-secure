package com.koushik.soundcloud.dto.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UploadProgressResponse {
    private String fileId;
    private String fileName;
    private long bytesTransferred;
    private long totalBytes;
    private double progressPercentage;
    private String status; // UPLOADING, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private TrackResponse track;
}
