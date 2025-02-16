package com.koushik.soundcloud.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserPreferencesRequest {
    
    private Boolean defaultPrivacy;
    private Boolean enableEncryption;
    
    @Pattern(regexp = "^(light|dark)$", message = "Theme must be either 'light' or 'dark'")
    private String theme;
    
    @Pattern(regexp = "^(low|medium|high)$", message = "Quality preference must be either 'low', 'medium', or 'high'")
    private String qualityPreference;
    
    private Boolean autoSyncEnabled;
}
