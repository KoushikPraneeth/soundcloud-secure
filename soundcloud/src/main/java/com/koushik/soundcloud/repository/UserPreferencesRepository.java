package com.koushik.soundcloud.repository;

import com.koushik.soundcloud.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, UUID> {
    Optional<UserPreferences> findByUserId(UUID userId);
    
    @Modifying
    @Query("UPDATE UserPreferences up SET up.googleDriveAccessToken = :accessToken, " +
           "up.googleDriveRefreshToken = :refreshToken WHERE up.userId = :userId")
    void updateCloudStorageTokens(@Param("userId") UUID userId,
                                @Param("accessToken") String accessToken,
                                @Param("refreshToken") String refreshToken);
    
    @Modifying
    @Query("UPDATE UserPreferences up SET up.googleDriveFolderId = :folderId " +
           "WHERE up.userId = :userId")
    void updateCloudStorageFolderId(@Param("userId") UUID userId,
                                   @Param("folderId") String folderId);
}
