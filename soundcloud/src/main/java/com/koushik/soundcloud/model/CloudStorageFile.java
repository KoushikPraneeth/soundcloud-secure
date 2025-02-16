package com.koushik.soundcloud.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
