// Zero-Knowledge Encryption Module
// Uses Web Crypto API for secure, performant operations.

const ITERATIONS = 600000; // Recommend by OWASP for PBKDF2-HMAC-SHA256
const HASH_ALGO = 'SHA-256';
const SALT_SIZE = 16;
const IV_SIZE = 12; // Standard for GCM

// 1. Derive Key from Master Password
// We use PBKDF2. in a real app, the salt should be unique per user and stored.
// For this MVP, we will require the user to provide their email as a salt component or generating a random one and storing it plain.
// To ensure we can recover the key, we will generate a random salt on registration, store it in public user profile (Backend),
// and fetch it before deriving the key login.
// 
// However, for strict zero-knowledge in this scope without complex user-metadata fetching flows yet:
// We will use a deterministic hash of the email as the salt. 
// KEEP IN MIND: Random salt stored on server is better for rainbow table protection.
// Let's implement the "Random Salt Stored on Server" approach as it's more secure.
// But valid for this task: We will assume the UI passes a 'salt' derived from the user's UID or Email for simplicity if storage isn't ready,
// BUT proper implementation:
export const generateSalt = () => {
    return window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
};

export const arrayBufferToHex = (buffer) => {
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
};

export const hexToArrayBuffer = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
};

// Derive a formatted key for AES-GCM
export const deriveKey = async (password, salt) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const saltBuffer = typeof salt === 'string' ? enc.encode(salt) : salt;

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: ITERATIONS,
            hash: HASH_ALGO
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // Key is non-extractable!
        ["encrypt", "decrypt"]
    );
};

// Encrypt data
export const encryptData = async (permissionKey, plainText) => {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        permissionKey,
        enc.encode(plainText)
    );

    return {
        ciphertext: arrayBufferToHex(encrypted),
        iv: arrayBufferToHex(iv)
    };
};

// Decrypt data
export const decryptData = async (permissionKey, ciphertextHex, ivHex) => {
    try {
        const ciphertext = hexToArrayBuffer(ciphertextHex);
        const iv = hexToArrayBuffer(ivHex);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            permissionKey,
            ciphertext
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("Failed to decrypt. Master password might be wrong or data corrupted.");
    }
};
