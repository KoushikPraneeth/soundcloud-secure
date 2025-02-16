package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.PlaylistTrack;
import com.koushik.soundcloud.entity.PlaylistTrack.PlaylistTrackId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaylistTrackRepository extends JpaRepository<PlaylistTrack, PlaylistTrackId> {
    List<PlaylistTrack> findByPlaylistIdOrderByPosition(UUID playlistId);
    
    @Query("SELECT MAX(pt.position) FROM PlaylistTrack pt WHERE pt.playlist.id = :playlistId")
    Integer findMaxPositionInPlaylist(@Param("playlistId") UUID playlistId);
    
    void deleteByPlaylistId(UUID playlistId);
    
    @Query("SELECT CASE WHEN COUNT(pt) > 0 THEN true ELSE false END FROM PlaylistTrack pt " +
           "WHERE pt.playlist.id = :playlistId AND pt.track.id = :trackId")
    boolean existsByPlaylistIdAndTrackId(@Param("playlistId") UUID playlistId, @Param("trackId") UUID trackId);
}
