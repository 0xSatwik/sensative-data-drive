import CryptoJS from 'crypto-js';

const ITERATIONS = 1000; // Number of iterations for PBKDF2
const KEY_SIZE = 256 / 32; // Key size in words (256 bits / 32 = 8 words)

export interface EncryptResult {
  encryptedData: string; // Base64 encoded encrypted data
  iv: string;          // Base64 encoded initialization vector
  salt: string;        // Base64 encoded salt
}

export interface PrivateKeyParts {
  part1: string;
  part2: string;
}

// Function to encrypt data using AES-256-GCM (simulated with AES-CBC since CryptoJS doesn't support GCM)
export const encryptData = (data: string, password: string): EncryptResult => {
  // Generate a random salt
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  
  // Generate a key from the password
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS
  });
  
  // Generate a random IV
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  
  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  // Return the encrypted data, IV, and salt as Base64 strings
  return {
    encryptedData: encrypted.toString(),
    iv: CryptoJS.enc.Base64.stringify(iv),
    salt: CryptoJS.enc.Base64.stringify(salt)
  };
};

// Function to decrypt data
export const decryptData = (
  encryptedData: string, 
  password: string, 
  iv: string, 
  salt: string
): string => {
  try {
    // Convert Base64 strings back to WordArray
    const ivParams = CryptoJS.enc.Base64.parse(iv);
    const saltParams = CryptoJS.enc.Base64.parse(salt);
    
    // Derive the key from the password and salt
    const key = CryptoJS.PBKDF2(password, saltParams, {
      keySize: KEY_SIZE,
      iterations: ITERATIONS
    });
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: ivParams,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    // Convert the decrypted data to a UTF-8 string
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // If decryption fails, likely due to an incorrect password
    throw new Error('Decryption failed. Please check your password.');
  }
};

// Function to split a private key into two parts for secure display
export const splitPrivateKey = (privateKey: string): PrivateKeyParts => {
  const midpoint = Math.floor(privateKey.length / 2);
  return {
    part1: privateKey.substring(0, midpoint),
    part2: privateKey.substring(midpoint)
  };
};

// Function to combine the two parts of a private key
export const combinePrivateKey = (part1: string, part2: string): string => {
  return part1 + part2;
}; 