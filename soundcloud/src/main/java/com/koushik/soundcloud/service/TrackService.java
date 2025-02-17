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
    private final GoogleDriveService googleDriveService;

    public Track uploadTrack(MultipartFile file, String userId) throws Exception {
        // Extract metadata
        Metadata metadata = extractMetadata(file.getBytes());
        
        // Upload to Google Drive
        String fileId = UUID.randomUUID().toString();
        var cloudFile = googleDriveService.uploadFile(file, userId);

        // Create track with metadata
        return Track.builder()
                .id(UUID.randomUUID().toString())
                .title(metadata.get("title"))
                .artist(metadata.get("xmpDM:artist"))
                .album(metadata.get("xmpDM:album"))
                .genre(metadata.get("xmpDM:genre"))
                .year(parseYear(metadata.get("xmpDM:releaseDate")))
                .duration(parseDuration(metadata.get("xmpDM:duration")))
                .fileId(cloudFile.getId())
                .userId(userId)
                .format(file.getContentType())
                .bitrate(parseBitrate(metadata.get("xmpDM:audioCompressor")))
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
