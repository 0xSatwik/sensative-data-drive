import CryptoJS from 'crypto-js';

// Security constants - using OWASP recommended values
const ITERATIONS = 600000; // OWASP recommended for PBKDF2-SHA256
const KEY_SIZE = 256; // 256-bit key for AES-256
const SALT_SIZE = 16; // 128-bit salt
const IV_SIZE = 12; // 96-bit IV for GCM (recommended)

export interface EncryptResult {
  encryptedData: string; // Base64 encoded encrypted data
  iv: string;            // Base64 encoded initialization vector
  salt: string;          // Base64 encoded salt
  version: number;       // Encryption version for backward compatibility
}

export interface PrivateKeyParts {
  part1: string;
  part2: string;
}

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derive encryption key from password using PBKDF2 with Web Crypto API
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as a key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: KEY_SIZE
    },
    false,
    ['encrypt', 'decrypt']
  );
};

// NEW: Encrypt data using AES-256-GCM with Web Crypto API
export const encryptData = async (data: string, password: string): Promise<EncryptResult> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

  // Derive key
  const key = await deriveKey(password, salt);

  // Encrypt using AES-GCM (authenticated encryption)
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    dataBuffer
  );

  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
    version: 2 // Version 2 = AES-GCM with Web Crypto
  };
};

// NEW: Decrypt data using AES-256-GCM with Web Crypto API
export const decryptDataV2 = async (
  encryptedData: string,
  password: string,
  iv: string,
  salt: string
): Promise<string> => {
  try {
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));
    const saltBuffer = new Uint8Array(base64ToArrayBuffer(salt));

    // Derive key
    const key = await deriveKey(password, saltBuffer);

    // Decrypt using AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed. Please check your password.');
  }
};

// LEGACY: Decrypt data using old CryptoJS (for backward compatibility)
const decryptDataV1 = (
  encryptedData: string,
  password: string,
  iv: string,
  salt: string
): string => {
  try {
    const LEGACY_ITERATIONS = 1000;
    const LEGACY_KEY_SIZE = 256 / 32;

    // Convert Base64 strings back to WordArray
    const ivParams = CryptoJS.enc.Base64.parse(iv);
    const saltParams = CryptoJS.enc.Base64.parse(salt);

    // Derive the key from the password and salt
    const key = CryptoJS.PBKDF2(password, saltParams, {
      keySize: LEGACY_KEY_SIZE,
      iterations: LEGACY_ITERATIONS
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
    throw new Error('Decryption failed. Please check your password.');
  }
};

// Smart decryption that handles both old and new formats
export const decryptData = async (
  encryptedData: string,
  password: string,
  iv: string,
  salt: string,
  version?: number
): Promise<string> => {
  // Version 2+ uses new Web Crypto API with AES-GCM
  if (version && version >= 2) {
    return decryptDataV2(encryptedData, password, iv, salt);
  }

  // Legacy entries (version 1 or undefined) use old CryptoJS
  // Try V1 first (legacy)
  try {
    const result = decryptDataV1(encryptedData, password, iv, salt);
    if (result && result.length > 0) {
      return result;
    }
  } catch (e) {
    // V1 failed, try V2
  }

  // Fallback to V2 if V1 fails
  try {
    return await decryptDataV2(encryptedData, password, iv, salt);
  } catch (e) {
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

// Password strength checker
export interface PasswordStrength {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let score: number;
  let label: 'weak' | 'fair' | 'good' | 'strong';
  let color: string;

  if (metRequirements <= 1 || password.length < 8) {
    score = 0;
    label = 'weak';
    color = '#ef4444'; // red
  } else if (metRequirements === 2) {
    score = 1;
    label = 'weak';
    color = '#ef4444'; // red
  } else if (metRequirements === 3) {
    score = 2;
    label = 'fair';
    color = '#f59e0b'; // amber
  } else if (metRequirements === 4) {
    score = 3;
    label = 'good';
    color = '#22c55e'; // green
  } else {
    score = 4;
    label = 'strong';
    color = '#16a34a'; // dark green
  }

  return { score, label, color, requirements };
};

// Check if password meets minimum requirements for encryption
export const isPasswordStrongEnough = (password: string): boolean => {
  const strength = checkPasswordStrength(password);
  return strength.score >= 3; // Require at least "good" strength
};