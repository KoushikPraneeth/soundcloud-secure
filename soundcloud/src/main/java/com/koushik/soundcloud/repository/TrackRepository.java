package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrackRepository extends JpaRepository<Track, UUID> {
    List<Track> findByUserId(UUID userId);
    
    List<Track> findByUserIdAndTitleContainingIgnoreCase(UUID userId, String title);
    
    @Query("SELECT t FROM Track t WHERE t.userId = :userId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.album) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Track> searchTracks(@Param("userId") UUID userId, @Param("query") String query);
    
    List<Track> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    boolean existsByFileIdAndUserId(String fileId, UUID userId);
}
