package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {
    List<Playlist> findByUserId(UUID userId);
    
    List<Playlist> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    @Query("SELECT p FROM Playlist p WHERE p.userId = :userId OR p.isPublic = true")
    List<Playlist> findAccessiblePlaylists(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true")
    List<Playlist> findPublicPlaylists();
    
    @Query("SELECT p FROM Playlist p WHERE p.id = :playlistId AND (p.userId = :userId OR p.isPublic = true)")
    Optional<Playlist> findAccessiblePlaylist(@Param("playlistId") UUID playlistId, @Param("userId") UUID userId);
    
    List<Playlist> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name);
    
    @Query("SELECT p FROM Playlist p WHERE p.userId = :userId AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Playlist> searchPlaylists(@Param("userId") UUID userId, @Param("query") String query);
}
