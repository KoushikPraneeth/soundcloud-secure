package com.koushik.soundcloud.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koushik.soundcloud.entity.UserPreferences;
import com.koushik.soundcloud.repository.UserPreferencesRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {
    
    private final UserPreferencesRepository userPreferencesRepository;
    
    @Transactional
    public UserPreferences createUserPreferences(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return userPreferencesRepository.save(UserPreferences.builder()
            .userId(userId)
            .defaultPrivacy(false)
            .theme("light")
            .qualityPreference("high")
            .build());
    }
    
    @Transactional
    public UserPreferences updateGoogleDriveSettings(
            String userIdStr,
            String accessToken,
            String refreshToken,
            String folderId
    ) {
        UUID userId = UUID.fromString(userIdStr);
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userIdStr));
            
        preferences.setGoogleDriveAccessToken(accessToken);
        preferences.setGoogleDriveRefreshToken(refreshToken);
        preferences.setGoogleDriveFolderId(folderId);
        
        return userPreferencesRepository.save(preferences);
    }
    
    @Transactional
    public UserPreferences updatePreferences(
            String userIdStr,
            Boolean defaultPrivacy,
            String theme,
            String qualityPreference
    ) {
        UUID userId = UUID.fromString(userIdStr);
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userIdStr));
            
        if (defaultPrivacy != null) {
            preferences.setDefaultPrivacy(defaultPrivacy);
        }
        if (theme != null) {
            preferences.setTheme(theme);
        }
        if (qualityPreference != null) {
            preferences.setQualityPreference(qualityPreference);
        }
        
        return userPreferencesRepository.save(preferences);
    }
    
    public UserPreferences getUserPreferences(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userIdStr));
    }
    
    @Transactional
    public void deleteUserPreferences(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        userPreferencesRepository.deleteById(userId);
    }
}
