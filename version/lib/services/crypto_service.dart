
import 'dart:convert';
import 'dart:typed_data';
import 'package:pointycastle/export.dart';
import 'package:flutter/foundation.dart';
// ignore: implementation_imports
import 'package:pointycastle/src/platform_check/platform_check.dart';

class CryptoService {
  static const int _iterations = 600000; // OWASP recommended for PBKDF2-SHA256
  static const int _keySize = 256; // 256-bit key
  static const int _saltSize = 16; // 128-bit salt
  static const int _ivSize = 12; // 96-bit IV for GCM

  /// Derive a 256-bit key from the password using PBKDF2 with SHA-256 and 600k iterations.
  static Uint8List _deriveKey(String password, Uint8List salt) {
    final pbkdf2 = PBKDF2KeyDerivator(HMac(SHA256Digest(), 64))
      ..init(Pbkdf2Parameters(salt, _iterations, _keySize ~/ 8));

    return pbkdf2.process(Uint8List.fromList(utf8.encode(password)));
  }

  /// Encrypt data using AES-256-GCM.
  /// Returns a map containing 'encryptedData', 'iv', 'salt', and 'version'.
  static Future<Map<String, dynamic>> encryptData(String data, String password) async {
    // Generate random salt and IV
    final salt = _generateRandomBytes(_saltSize);
    final iv = _generateRandomBytes(_ivSize);

    // Derive key
    final key = _deriveKey(password, salt);

    // Setup AES-GCM
    final cipher = GCMBlockCipher(AESEngine())
      ..init(
        true, // true = encrypt
        AEADParameters(
          KeyParameter(key),
          128, // Mac size (128 bits is standard for GCM)
          iv,
          Uint8List(0), // No associated data
        ),
      );

    // Encrypt
    final input = Uint8List.fromList(utf8.encode(data));
    final encrypted = cipher.process(input);

    return {
      'encryptedData': base64.encode(encrypted),
      'iv': base64.encode(iv),
      'salt': base64.encode(salt),
      'version': 2,
    };
  }

  /// Decrypt data using AES-256-GCM.
  static Future<String> decryptData(
    String encryptedData,
    String password,
    String ivBase64,
    String saltBase64,
  ) async {
    try {
      final encryptedBytes = base64.decode(encryptedData);
      final iv = base64.decode(ivBase64);
      final salt = base64.decode(saltBase64);

      // Derive key
      final key = _deriveKey(password, salt);

      // Setup AES-GCM
      final cipher = GCMBlockCipher(AESEngine())
        ..init(
          false, // false = decrypt
          AEADParameters(
            KeyParameter(key),
            128, // Mac size
            iv,
            Uint8List(0), // No associated data
          ),
        );

      // Decrypt
      final decrypted = cipher.process(encryptedBytes);
      return utf8.decode(decrypted);
    } catch (e) {
      throw Exception('Decryption failed. Please check your password.');
    }
  }

  static Uint8List _generateRandomBytes(int length) {
    final secureRandom = SecureRandom("Fortuna")
      ..seed(KeyParameter(Platform.instance.platformEntropySource().getBytes(32)));
    return secureRandom.nextBytes(length);
  }

  // --- Password Strength Checker (Ported from PasswordStrengthMeter.tsx) ---

  static Map<String, dynamic> checkPasswordStrength(String password) {
    final requirements = {
      'minLength': password.length >= 12,
      'hasUppercase': RegExp(r'[A-Z]').hasMatch(password),
      'hasLowercase': RegExp(r'[a-z]').hasMatch(password),
      'hasNumber': RegExp(r'[0-9]').hasMatch(password),
      'hasSymbol': RegExp(r'[!@#$%^&*()_+\-=[\]{};'':"\\|,.<>/?]').hasMatch(password),
    };

    final metRequirements = requirements.values.where((v) => v).length;

    int score;
    String label;
    String color; // Hex string for color

    if (metRequirements <= 1 || password.length < 8) {
      score = 0;
      label = 'weak';
      color = '#ef4444'; // red
    } else if (metRequirements == 2) {
      score = 1;
      label = 'weak';
      color = '#ef4444'; // red
    } else if (metRequirements == 3) {
      score = 2;
      label = 'fair';
      color = '#f59e0b'; // amber
    } else if (metRequirements == 4) {
      score = 3;
      label = 'good';
      color = '#22c55e'; // green
    } else {
      score = 4;
      label = 'strong';
      color = '#16a34a'; // dark green
    }

    return {
      'score': score, // 0-4
      'label': label,
      'color': color,
      'requirements': requirements,
    };
  }
}
