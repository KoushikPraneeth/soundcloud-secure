package com.koushik.soundcloud.exception;

import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import io.jsonwebtoken.JwtException;
import java.io.IOException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException e) {
        log.error("JWT validation failed: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse("Invalid or expired token"),
            HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.error("Access denied: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse("Access denied"),
            HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(CloudStorageException.class)
    public ResponseEntity<ErrorResponse> handleCloudStorageException(CloudStorageException e) {
        log.error("Cloud storage error: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse(e.getMessage()),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(GoogleJsonResponseException.class)
    public ResponseEntity<ErrorResponse> handleGoogleJsonResponseException(GoogleJsonResponseException e) {
        GoogleJsonError error = e.getDetails();
        log.error("Google API error: {}, code: {}", error.getMessage(), error.getCode());
        
        HttpStatus status = switch (error.getCode()) {
            case 401 -> HttpStatus.UNAUTHORIZED;
            case 403 -> HttpStatus.FORBIDDEN;
            case 404 -> HttpStatus.NOT_FOUND;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
        
        return new ResponseEntity<>(
            new ErrorResponse(error.getMessage()),
            status
        );
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException e) {
        log.error("IO error: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse("Failed to process file operation"),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error("File size exceeded: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse("File size exceeds maximum allowed size"),
            HttpStatus.PAYLOAD_TOO_LARGE
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse("An unexpected error occurred"),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    private record ErrorResponse(String message) {}
}
