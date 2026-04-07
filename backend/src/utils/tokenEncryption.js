const crypto = require("crypto");

/**
 * Token Encryption Utility
 * Encrypts sensitive tokens before storing in database
 * Uses AES-256-GCM for authenticated encryption
 *
 * Environment Variables Required:
 * - ENCRYPTION_KEY: 32-byte hex string (256-bit key)
 *   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // AES block size
const AUTH_TAG_LENGTH = 16; // GCM authentication tag

/**
 * Encrypt token
 * @param {String} plainText - Token to encrypt
 * @returns {String} Encrypted token with IV + authTag + ciphertext (base64)
 */
function encryptToken(plainText) {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      console.warn(
        "[TokenEncryption] ENCRYPTION_KEY not set. Using plaintext (INSECURE FOR PRODUCTION)"
      );
      return plainText;
    }

    // Convert hex key to buffer
    const key = Buffer.from(encryptionKey, "hex");

    if (key.length !== 32) {
      throw new Error("ENCRYPTION_KEY must be 32 bytes (256 bits)");
    }

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine: IV + authTag + ciphertext
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, "hex")]);

    // Return as base64 for easy storage
    return combined.toString("base64");
  } catch (error) {
    console.error(`[TokenEncryption] Encryption error: ${error.message}`);
    throw error;
  }
}

/**
 * Decrypt token
 * @param {String} encryptedToken - Encrypted token (base64)
 * @returns {String} Decrypted token
 */
function decryptToken(encryptedToken) {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      // If key not set, assume plaintext storage
      return encryptedToken;
    }

    // Convert hex key to buffer
    const key = Buffer.from(encryptionKey, "hex");

    // Decode from base64
    const combined = Buffer.from(encryptedToken, "base64");

    // Extract components
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

    // Set authentication tag
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error(`[TokenEncryption] Decryption error: ${error.message}`);
    throw new Error("Failed to decrypt token. Key may be corrupted or token tampered.");
  }
}

/**
 * Generate a secure encryption key
 * Run this once and store in environment variable
 */
function generateEncryptionKey() {
  const key = crypto.randomBytes(32).toString("hex");
  console.log("Generated ENCRYPTION_KEY (add to .env):");
  console.log(`ENCRYPTION_KEY=${key}`);
  return key;
}

module.exports = {
  encryptToken,
  decryptToken,
  generateEncryptionKey,
};
