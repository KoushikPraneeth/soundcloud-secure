package com.koushik.soundcloud.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koushik.soundcloud.entity.UserPreferences;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.repository.UserPreferencesRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {
    
    private final UserPreferencesRepository userPreferencesRepository;
    
    @Transactional
    public UserPreferences createUserPreferences(String userId) {
        return userPreferencesRepository.save(UserPreferences.builder()
            .userId(userId)
            .defaultPrivacy(false)
            .enableEncryption(true)
            .theme("light")
            .qualityPreference("high")
            .autoSyncEnabled(true)
            .build());
    }
    
    @Transactional
    public UserPreferences updateCloudStorageSettings(
            String userId,
            CloudStorageProvider provider,
            String accessToken,
            String refreshToken,
            String folderId
    ) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userId));
            
        preferences.setCloudStorageProvider(provider);
        preferences.setCloudStorageAccessToken(accessToken);
        preferences.setCloudStorageRefreshToken(refreshToken);
        preferences.setCloudStorageFolderId(folderId);
        
        return userPreferencesRepository.save(preferences);
    }
    
    @Transactional
    public UserPreferences updatePreferences(
            String userId,
            Boolean defaultPrivacy,
            Boolean enableEncryption,
            String theme,
            String qualityPreference,
            Boolean autoSyncEnabled
    ) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userId));
            
        if (defaultPrivacy != null) {
            preferences.setDefaultPrivacy(defaultPrivacy);
        }
        if (enableEncryption != null) {
            preferences.setEnableEncryption(enableEncryption);
        }
        if (theme != null) {
            preferences.setTheme(theme);
        }
        if (qualityPreference != null) {
            preferences.setQualityPreference(qualityPreference);
        }
        if (autoSyncEnabled != null) {
            preferences.setAutoSyncEnabled(autoSyncEnabled);
        }
        
        return userPreferencesRepository.save(preferences);
    }
    
    public UserPreferences getUserPreferences(String userId) {
        return userPreferencesRepository.findByUserId(userId)
            .orElseGet(() -> createUserPreferences(userId));
    }
    
    @Transactional
    public void deleteUserPreferences(String userId) {
        userPreferencesRepository.deleteById(userId);
    }
}
