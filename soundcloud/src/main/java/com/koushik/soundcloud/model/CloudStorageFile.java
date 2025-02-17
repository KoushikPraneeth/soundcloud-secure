package com.koushik.soundcloud.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudStorageFile {
    private String id;
    private String name;
    private String mimeType;
    private long size;
    private String webViewLink;
    private String downloadUrl;
    private CloudStorageProvider provider;
    
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();
    
    public void setMetadata(String key, String value) {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        metadata.put(key, value);
    }
    
    public String getMetadata(String key) {
        return metadata != null ? metadata.get(key) : null;
    }
}
