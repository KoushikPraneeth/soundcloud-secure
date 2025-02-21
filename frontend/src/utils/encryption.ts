import CryptoJS from 'crypto-js';

interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

interface FileEncryptionResult {
  encryptedData: Blob;
  fileKey: string; // This is the per-file key that gets stored in the database
}

export class EncryptionManager {
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATION_COUNT = 100000;
  private static readonly KEY_LENGTH = 256;

  /**
   * Derives a key from a password using PBKDF2
   * @param password The user's password
   * @param salt Optional salt (if not provided, generates a new one)
   * @returns The derived key and salt
   */
  static async deriveKeyFromPassword(
    password: string,
    existingSalt?: Uint8Array
  ): Promise<EncryptionKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const salt = existingSalt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATION_COUNT,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );

    return { key, salt };
  }

  /**
   * Generates a random key for file encryption
   * @returns A base64 encoded random key
   */
  private static generateFileKey(): string {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...keyBytes));
  }

  /**
   * Encrypts a file using AES-GCM
   * @param file The file to encrypt
   * @param masterKey The user's master key (derived from password)
   * @returns The encrypted file and its encrypted key
   */
  static async encryptFile(file: File, masterKey: CryptoKey): Promise<FileEncryptionResult> {
    try {
      // Generate a unique key for this file
      const fileKey = this.generateFileKey();
      const fileKeyBuffer = new TextEncoder().encode(fileKey);

      // Encrypt the file key with the master key
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedKeyBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        masterKey,
        fileKeyBuffer
      );

      // Convert the file to an ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Encrypt the file content with the file key
      const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
      const encrypted = CryptoJS.AES.encrypt(wordArray, fileKey).toString();
      
      // Combine IV and encrypted key
      const combinedBuffer = new Uint8Array(iv.length + encryptedKeyBuffer.byteLength);
      combinedBuffer.set(iv);
      combinedBuffer.set(new Uint8Array(encryptedKeyBuffer), iv.length);
      
      // Store the encrypted key in base64 format
      const encryptedKey = btoa(String.fromCharCode(...combinedBuffer));
      
      // Create the final encrypted blob
      const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });
      
      return {
        encryptedData: encryptedBlob,
        fileKey: encryptedKey
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypts a file using AES-GCM
   * @param encryptedBlob The encrypted file blob
   * @param encryptedKey The encrypted file key from the database
   * @param masterKey The user's master key (derived from password)
   * @param mimeType The MIME type of the original file
   * @returns The decrypted file as a Blob
   */
  static async decryptFile(
    encryptedBlob: Blob,
    encryptedKey: string,
    masterKey: CryptoKey,
    mimeType: string = 'audio/mpeg'
  ): Promise<Blob> {
    try {
      // Decode the encrypted key
      const combinedBuffer = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
      const iv = combinedBuffer.slice(0, 12);
      const encryptedKeyBuffer = combinedBuffer.slice(12);

      // Decrypt the file key
      const decryptedKeyBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        masterKey,
        encryptedKeyBuffer
      );
      const fileKey = new TextDecoder().decode(decryptedKeyBuffer);

      // Decrypt the file content
      const encryptedText = await encryptedBlob.text();
      const decrypted = CryptoJS.AES.decrypt(encryptedText, fileKey);
      const typedArray = this.convertWordArrayToUint8Array(decrypted);
      
      return new Blob([typedArray], { type: mimeType });
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  /**
   * Determines the MIME type based on file extension
   * @param filename The name of the file
   * @returns The appropriate MIME type
   */
  static getMimeType(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'm4a':
        return 'audio/mp4';
      default:
        return 'audio/mpeg';
    }
  }

  private static convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);
    
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      u8[i] = byte;
    }
    
    return u8;
  }
}