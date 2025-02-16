package com.koushik.soundcloud.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.mp3.Mp3Parser;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.ContentHandler;
import org.xml.sax.helpers.DefaultHandler;

import com.koushik.soundcloud.model.Track;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final EncryptionService encryptionService;
    private final StorageService storageService;

    public Track uploadTrack(MultipartFile file, String userId) throws Exception {
        // Generate encryption key and IV
        String key = encryptionService.generateKey();
        String iv = encryptionService.generateIv();

        // Extract metadata before encryption
        Metadata metadata = extractMetadata(file.getBytes());
        
        // Encrypt file
        byte[] encryptedData = encryptionService.encrypt(file.getBytes(), key, iv);
        
        // Upload to storage
        String fileId = UUID.randomUUID().toString();
        String storageUrl = storageService.uploadFile(new ByteArrayInputStream(encryptedData), fileId, file.getContentType());

        // Create track with metadata
        return Track.builder()
                .id(UUID.randomUUID().toString())
                .title(metadata.get("title"))
                .artist(metadata.get("xmpDM:artist"))
                .album(metadata.get("xmpDM:album"))
                .genre(metadata.get("xmpDM:genre"))
                .year(parseYear(metadata.get("xmpDM:releaseDate")))
                .duration(parseDuration(metadata.get("xmpDM:duration")))
                .fileId(fileId)
                .userId(userId)
                .storageUrl(storageUrl)
                .format(file.getContentType())
                .bitrate(parseBitrate(metadata.get("xmpDM:audioCompressor")))
                .encryptionKey(key)
                .iv(iv)
                .createdAt(System.currentTimeMillis())
                .updatedAt(System.currentTimeMillis())
                .build();
    }

    private Metadata extractMetadata(byte[] data) throws Exception {
        ContentHandler handler = new DefaultHandler();
        Metadata metadata = new Metadata();
        Parser parser = new Mp3Parser();
        ParseContext parseCtx = new ParseContext();
        parser.parse(new ByteArrayInputStream(data), handler, metadata, parseCtx);
        return metadata;
    }

    private Integer parseYear(String releaseDate) {
        try {
            return releaseDate != null ? Integer.parseInt(releaseDate.substring(0, 4)) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseDuration(String duration) {
        try {
            return duration != null ? (long) (Double.parseDouble(duration) * 1000) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseBitrate(String bitrate) {
        try {
            return bitrate != null ? Long.parseLong(bitrate.replaceAll("[^0-9]", "")) : null;
        } catch (Exception e) {
            return null;
        }
    }
} 