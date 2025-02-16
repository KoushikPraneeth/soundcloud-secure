package com.koushik.soundcloud.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UploadTrackRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String artist;
    private String album;
    private String genre;
    private Integer year;
    
    private boolean encrypt = true;
}
