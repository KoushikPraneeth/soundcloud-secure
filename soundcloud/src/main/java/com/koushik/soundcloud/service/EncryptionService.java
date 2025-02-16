package com.koushik.soundcloud.service;

import com.koushik.soundcloud.dto.response.EncryptionResult;

public interface EncryptionService {
    /**
     * Encrypts the given data using a randomly generated key and IV
     */
    EncryptionResult encrypt(byte[] data);
    
    /**
     * Encrypts the given data using the provided key and IV
     */
    EncryptionResult encrypt(byte[] data, String key, String iv);
    
    /**
     * Generates a random encryption key
     */
    String generateKey();
    
    /**
     * Generates a random initialization vector
     */
    String generateIv();
    
    /**
     * Decrypts the given data using the provided key and IV
     */
    byte[] decrypt(byte[] encryptedData, String key, String iv);
}
