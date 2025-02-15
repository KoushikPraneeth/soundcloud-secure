package com.koushik.soundcloud.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.koushik.soundcloud.model.CloudStorageFile;
import com.koushik.soundcloud.model.CloudStorageProvider;
import com.koushik.soundcloud.model.ShareLink;
import com.koushik.soundcloud.model.ShareLinkAccessType;
import com.koushik.soundcloud.model.ShareLinkStatus;
import com.koushik.soundcloud.service.impl.ShareLinkServiceImpl;

@ExtendWith(MockitoExtension.class)
class ShareLinkServiceTest {

    @Mock
    private CloudStorageService cloudStorageService;

    @InjectMocks
    private ShareLinkServiceImpl shareLinkService;

    private static final String USER_ID = "test-user";
    private static final String FILE_ID = "test-file";

    private CloudStorageFile testFile;

    @BeforeEach
    void setUp() {
        testFile = CloudStorageFile.builder()
            .id(FILE_ID)
            .name("test.mp3")
            .mimeType("audio/mpeg")
            .provider(CloudStorageProvider.GOOGLE_DRIVE)
            .build();
    }

    @Test
    void createShareLink_Success() {
        // Arrange
        when(cloudStorageService.getFile(USER_ID, FILE_ID)).thenReturn(testFile);
        
        // Act
        ShareLink shareLink = shareLinkService.createShareLink(
            USER_ID,
            FILE_ID,
            ShareLinkAccessType.READ_ONLY,
            24
        );
        
        // Assert
        assertNotNull(shareLink);
        assertEquals(USER_ID, shareLink.getUserId());
        assertEquals(FILE_ID, shareLink.getFileId());
        assertEquals(ShareLinkStatus.ACTIVE, shareLink.getStatus());
        assertEquals(ShareLinkAccessType.READ_ONLY, shareLink.getAccessType());
        assertNotNull(shareLink.getToken());
        assertTrue(shareLink.getExpiresAt().isAfter(LocalDateTime.now()));
        
        verify(cloudStorageService).getFile(USER_ID, FILE_ID);
    }

    @Test
    void listShareLinks_ReturnsOnlyActiveLinks() {
        // Arrange
        ShareLink link = shareLinkService.createShareLink(
            USER_ID,
            FILE_ID,
            ShareLinkAccessType.READ_ONLY,
            24
        );
        
        // Act
        List<ShareLink> links = shareLinkService.listShareLinks(USER_ID);
        
        // Assert
        assertFalse(links.isEmpty());
        assertTrue(links.stream().allMatch(l -> l.getStatus() == ShareLinkStatus.ACTIVE));
        assertTrue(links.contains(link));
    }

    @Test
    void revokeShareLink_Success() {
        // Arrange
        ShareLink link = shareLinkService.createShareLink(
            USER_ID,
            FILE_ID,
            ShareLinkAccessType.READ_ONLY,
            24
        );
        
        // Act
        shareLinkService.revokeShareLink(USER_ID, link.getId());
        
        // Assert
        ShareLink revokedLink = shareLinkService.getShareLink(USER_ID, link.getId());
        assertNotNull(revokedLink);
        assertEquals(ShareLinkStatus.REVOKED, revokedLink.getStatus());
    }

    @Test
    void validateShareLinkToken_ValidToken_ReturnsLink() {
        // Arrange
        ShareLink link = shareLinkService.createShareLink(
            USER_ID,
            FILE_ID,
            ShareLinkAccessType.READ_ONLY,
            24
        );
        
        // Act
        ShareLink validatedLink = shareLinkService.validateShareLinkToken(link.getToken());
        
        // Assert
        assertNotNull(validatedLink);
        assertEquals(link.getId(), validatedLink.getId());
    }

    @Test
    void validateShareLinkToken_ExpiredToken_ReturnsNull() {
        // Arrange
        ShareLink link = shareLinkService.createShareLink(
            USER_ID,
            FILE_ID,
            ShareLinkAccessType.READ_ONLY,
            -1 // Expired
        );
        
        // Act
        ShareLink validatedLink = shareLinkService.validateShareLinkToken(link.getToken());
        
        // Assert
        assertNull(validatedLink);
        assertEquals(ShareLinkStatus.EXPIRED, link.getStatus());
    }
}
