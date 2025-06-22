/**
 * EncryptedStore - Chrome Extension version using chrome.storage
 * Uses Web Crypto API for AES-256-GCM encryption with PBKDF2 key derivation
 */

class EncryptedStore {
  constructor(namespace = 'default') {
    this.namespace = namespace;
    this.keyCache = new Map();
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random salt
   */
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  /**
   * Get or create encryption key for this namespace
   */
  async getKey() {
    if (this.keyCache.has(this.namespace)) {
      return this.keyCache.get(this.namespace);
    }

    // Try to get existing salt from chrome.storage
    const storageKey = `${this.namespace}_salt`;
    const result = await chrome.storage.local.get(storageKey);
    
    let salt;
    if (result[storageKey]) {
      salt = new Uint8Array(result[storageKey]);
    } else {
      salt = this.generateSalt();
      await chrome.storage.local.set({ [storageKey]: Array.from(salt) });
    }

    // Use namespace as password (in production, this would be user-derived)
    const password = `prompt-scrubber-${this.namespace}`;
    const key = await this.deriveKey(password, salt);
    
    this.keyCache.set(this.namespace, { key, salt });
    return { key, salt };
  }

  /**
   * Encrypt data
   */
  async encrypt(data) {
    const { key } = await this.getKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(JSON.stringify(data))
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData) {
    const { key } = await this.getKey();
    const decoder = new TextDecoder();
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.encrypted)
    );

    return JSON.parse(decoder.decode(decrypted));
  }

  /**
   * Store encrypted data using chrome.storage
   */
  async set(key, value) {
    try {
      const encrypted = await this.encrypt(value);
      const storageKey = `${this.namespace}:${key}`;
      
      await chrome.storage.local.set({ [storageKey]: encrypted });
    } catch (error) {
      console.error('EncryptedStore: Failed to store data', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data from chrome.storage
   */
  async get(key) {
    try {
      const storageKey = `${this.namespace}:${key}`;
      const result = await chrome.storage.local.get(storageKey);
      const encrypted = result[storageKey];

      if (!encrypted) return null;
      return await this.decrypt(encrypted);
    } catch (error) {
      console.error('EncryptedStore: Failed to retrieve data', error);
      return null;
    }
  }

  /**
   * Remove data from chrome.storage
   */
  async remove(key) {
    const storageKey = `${this.namespace}:${key}`;
    await chrome.storage.local.remove(storageKey);
  }

  /**
   * Clear all data for this namespace from chrome.storage
   */
  async clear() {
    const allData = await chrome.storage.local.get();
    const keysToRemove = Object.keys(allData).filter(key => 
      key.startsWith(`${this.namespace}:`)
    );
    
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
  }
}

// Export for use in extension
if (typeof self !== 'undefined') {
  self.EncryptedStore = EncryptedStore;
}