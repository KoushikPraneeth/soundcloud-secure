package com.koushik.soundcloud.service.impl;

import com.koushik.soundcloud.service.EncryptionService;
import com.koushik.soundcloud.dto.response.EncryptionResult;
import com.koushik.soundcloud.exception.CloudStorageException;

import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AESEncryptionService implements EncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String CIPHER_TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int KEY_SIZE = 256;
    private static final int IV_SIZE = 16;

    @Override
    public EncryptionResult encrypt(byte[] data) {
        try {
            String key = generateKey();
            String iv = generateIv();
            return encrypt(data, key, iv);
        } catch (Exception e) {
            throw new CloudStorageException("Error encrypting data", e);
        }
    }

    @Override
    public EncryptionResult encrypt(byte[] data, String key, String iv) {
        try {
            SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(key), ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(Base64.getDecoder().decode(iv));

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

            byte[] encryptedData = cipher.doFinal(data);
            return EncryptionResult.builder()
                    .data(encryptedData)
                    .key(key)
                    .iv(iv)
                    .build();
        } catch (Exception e) {
            throw new CloudStorageException("Error encrypting data", e);
        }
    }

    @Override
    public String generateKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
            keyGen.init(KEY_SIZE);
            SecretKey key = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new CloudStorageException("Error generating encryption key", e);
        }
    }

    @Override
    public String generateIv() {
        try {
            byte[] iv = new byte[IV_SIZE];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(iv);
            return Base64.getEncoder().encodeToString(iv);
        } catch (Exception e) {
            throw new CloudStorageException("Error generating IV", e);
        }
    }

    @Override
    public byte[] decrypt(byte[] encryptedData, String key, String iv) {
        try {
            SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(key), ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(Base64.getDecoder().decode(iv));

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);

            return cipher.doFinal(encryptedData);
        } catch (Exception e) {
            throw new CloudStorageException("Error decrypting data", e);
        }
    }
}
