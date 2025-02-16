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
    @Query("UPDATE UserPreferences up SET up.cloudStorageAccessToken = :accessToken, " +
           "up.cloudStorageRefreshToken = :refreshToken WHERE up.userId = :userId")
    void updateCloudStorageTokens(@Param("userId") UUID userId,
                                @Param("accessToken") String accessToken,
                                @Param("refreshToken") String refreshToken);
    
    @Modifying
    @Query("UPDATE UserPreferences up SET up.cloudStorageFolderId = :folderId " +
           "WHERE up.userId = :userId")
    void updateCloudStorageFolderId(@Param("userId") UUID userId,
                                   @Param("folderId") String folderId);
    
    @Query("SELECT up.cloudStorageProvider FROM UserPreferences up WHERE up.userId = :userId")
    Optional<String> findCloudStorageProviderByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(up) > 0 FROM UserPreferences up " +
           "WHERE up.userId = :userId AND up.enableEncryption = true")
    boolean isEncryptionEnabled(@Param("userId") UUID userId);
}
