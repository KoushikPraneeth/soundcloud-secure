package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {
    List<Playlist> findByUserId(String userId);
    
    List<Playlist> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT p FROM Playlist p WHERE p.userId = :userId OR p.isPublic = true")
    List<Playlist> findAccessiblePlaylists(@Param("userId") String userId);
    
    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true")
    List<Playlist> findPublicPlaylists();
    
    @Query("SELECT p FROM Playlist p WHERE p.id = :playlistId AND (p.userId = :userId OR p.isPublic = true)")
    Optional<Playlist> findAccessiblePlaylist(@Param("playlistId") String playlistId, @Param("userId") String userId);
    
    List<Playlist> findByUserIdAndNameContainingIgnoreCase(String userId, String name);
    
    @Query("SELECT p FROM Playlist p WHERE p.userId = :userId AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Playlist> searchPlaylists(@Param("userId") String userId, @Param("query") String query);
}
