package com.koushik.soundcloud.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EncryptionService {
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Data
    public static class EncryptedData {
        private final InputStream inputStream;
        private final String key;
        private final String iv;
    }

    public EncryptedData encrypt(InputStream data) throws Exception {
        // Generate a random key
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(KEY_SIZE);
        SecretKey key = keyGen.generateKey();
        
        // Generate a random IV
        byte[] iv = new byte[GCM_IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        
        // Initialize cipher
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        
        // Encrypt the data
        byte[] inputData = data.readAllBytes();
        byte[] encryptedData = cipher.doFinal(inputData);
        
        return new EncryptedData(
            new ByteArrayInputStream(encryptedData),
            Base64.getEncoder().encodeToString(key.getEncoded()),
            Base64.getEncoder().encodeToString(iv)
        );
    }

    public byte[] decrypt(byte[] encryptedData, String encodedKey, String encodedIv) throws Exception {
        // Decode the key and IV
        byte[] keyBytes = Base64.getDecoder().decode(encodedKey);
        byte[] iv = Base64.getDecoder().decode(encodedIv);
        
        // Reconstruct the secret key
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        
        // Initialize cipher
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        
        // Decrypt the data
        return cipher.doFinal(encryptedData);
    }
}
