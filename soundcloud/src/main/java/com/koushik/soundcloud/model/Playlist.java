package com.koushik.soundcloud.model;

import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Playlist {
    private String id;
    private String name;
    private String description;
    private String userId;
    private List<String> trackIds;
    private Boolean isPublic;
    private String shareToken;
    private Long shareExpiry;
    private Long createdAt;
    private Long updatedAt;
} 