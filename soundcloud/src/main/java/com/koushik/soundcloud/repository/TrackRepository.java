package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, String> {
    List<Track> findByUserId(String userId);
    
    List<Track> findByUserIdAndTitleContainingIgnoreCase(String userId, String title);
    
    @Query("SELECT t FROM Track t WHERE t.userId = :userId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.album) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Track> searchTracks(@Param("userId") String userId, @Param("query") String query);
    
    List<Track> findByUserIdOrderByCreatedAtDesc(String userId);
    
    boolean existsByFileIdAndUserId(String fileId, String userId);
}
