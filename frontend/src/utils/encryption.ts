import CryptoJS from 'crypto-js';

export class EncryptionManager {
  private static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  static async encryptFile(file: File): Promise<{ encryptedData: Blob; key: string }> {
    const key = this.generateKey();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
          
          const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });
          resolve({ encryptedData: encryptedBlob, key });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  static async decryptFile(encryptedBlob: Blob, key: string): Promise<Blob> {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const encryptedText = e.target?.result as string;
          const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
          const typedArray = this.convertWordArrayToUint8Array(decrypted);
          
          const decryptedBlob = new Blob([typedArray], { type: 'audio/mpeg' });
          resolve(decryptedBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(encryptedBlob);
    });
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