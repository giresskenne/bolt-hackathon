/**
 * EncryptedStore - Client-side encrypted storage utility
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

    // Use namespace as password (in production, this would be user-derived)
    const password = `prompt-scrubber-${this.namespace}`;
    const salt = this.generateSalt();
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
   * Store encrypted data
   */
  async set(key, value) {
    try {
      const encrypted = await this.encrypt(value);
      const storageKey = `${this.namespace}:${key}`;
      
      // Try IndexedDB first, fallback to localStorage
      if ('indexedDB' in window) {
        await this.setIndexedDB(storageKey, encrypted);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(encrypted));
      }
    } catch (error) {
      console.error('EncryptedStore: Failed to store data', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async get(key) {
    try {
      const storageKey = `${this.namespace}:${key}`;
      let encrypted;

      // Try IndexedDB first, fallback to localStorage
      if ('indexedDB' in window) {
        encrypted = await this.getIndexedDB(storageKey);
      } else {
        const stored = localStorage.getItem(storageKey);
        encrypted = stored ? JSON.parse(stored) : null;
      }

      if (!encrypted) return null;
      return await this.decrypt(encrypted);
    } catch (error) {
      console.error('EncryptedStore: Failed to retrieve data', error);
      return null;
    }
  }

  /**
   * Remove data
   */
  async remove(key) {
    const storageKey = `${this.namespace}:${key}`;
    
    if ('indexedDB' in window) {
      await this.removeIndexedDB(storageKey);
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  /**
   * Clear all data for this namespace
   */
  async clear() {
    if ('indexedDB' in window) {
      await this.clearIndexedDB();
    } else {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${this.namespace}:`)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * IndexedDB operations
   */
  async setIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptScrubberStore', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const putRequest = store.put({ key, value });
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    });
  }

  async getIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptScrubberStore', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => {
          resolve(getRequest.result ? getRequest.result.value : null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    });
  }

  async removeIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptScrubberStore', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  async clearIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptScrubberStore', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
    });
  }
}

export { EncryptedStore };