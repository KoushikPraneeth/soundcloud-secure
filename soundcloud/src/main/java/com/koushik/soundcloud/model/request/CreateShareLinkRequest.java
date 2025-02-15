package com.koushik.soundcloud.model.request;

import com.koushik.soundcloud.model.ShareLinkAccessType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateShareLinkRequest {
    @NotBlank(message = "File ID is required")
    private String fileId;
    
    @NotNull(message = "Access type is required")
    private ShareLinkAccessType accessType;
    
    private Integer expirationHours;
}
