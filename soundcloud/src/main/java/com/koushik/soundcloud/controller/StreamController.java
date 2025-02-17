package com.koushik.soundcloud.controller;

import com.koushik.soundcloud.service.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/stream")
@RequiredArgsConstructor
public class StreamController {

    private final GoogleDriveService googleDriveService;

    @GetMapping("/{fileId}")
    public ResponseEntity<StreamingResponseBody> streamAudio(
            @PathVariable String fileId,
            @RequestHeader(value = "Range", required = false) String rangeHeader,
            Authentication authentication) throws IOException {

        String userId = authentication.getName();
        final byte[] fileData = googleDriveService.downloadFile(fileId, userId);
        
        // Get total length
        final long contentLength = fileData.length;
        
        // Parse range header
        long start = 0;
        long end = contentLength - 1;
        
        if (rangeHeader != null) {
            String[] ranges = rangeHeader.substring("bytes=".length()).split("-");
            start = Long.parseLong(ranges[0]);
            
            if (ranges.length > 1) {
                end = Long.parseLong(ranges[1]);
            }
            
            if (end >= contentLength) {
                end = contentLength - 1;
            }
        }
        
        // Calculate content length
        final long contentLengthToServe = end - start + 1;
        final long finalStart = start;
        final long finalEnd = end;
        
        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "audio/mpeg");
        headers.add("Accept-Ranges", "bytes");
        
        if (rangeHeader != null) {
            headers.add("Content-Range", String.format("bytes %d-%d/%d", finalStart, finalEnd, contentLength));
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .body(outputStream -> streamPartialContent(outputStream, fileData, finalStart, contentLengthToServe));
        } else {
            headers.setContentLength(contentLength);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(outputStream -> streamFullContent(outputStream, fileData));
        }
    }

    private void streamPartialContent(OutputStream outputStream, byte[] fileData, long start, long contentLengthToServe) throws IOException {
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(fileData)) {
            // Skip to start position
            inputStream.skip(start);
            
            // Write content
            byte[] buffer = new byte[4096];
            long toRead = contentLengthToServe;
            int len;
            
            while (toRead > 0 && (len = inputStream.read(buffer, 0, (int)Math.min(buffer.length, toRead))) != -1) {
                outputStream.write(buffer, 0, len);
                toRead -= len;
            }
            outputStream.flush();
        }
    }

    private void streamFullContent(OutputStream outputStream, byte[] fileData) throws IOException {
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(fileData)) {
            byte[] buffer = new byte[4096];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, len);
            }
            outputStream.flush();
        }
    }
}
