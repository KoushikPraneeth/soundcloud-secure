package com.koushik.soundcloud.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "playlist_tracks")
public class PlaylistTrack {
    @EmbeddedId
    private PlaylistTrackId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("trackId")
    @JoinColumn(name = "track_id")
    private Track track;
    
    private Integer position;
    
    @Column(name = "created_at", nullable = false)
    private Long createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = System.currentTimeMillis();
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaylistTrackId implements java.io.Serializable {
        private UUID playlistId;
        private UUID trackId;
    }
}
