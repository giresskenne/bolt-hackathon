/**
 * Unit tests for EncryptedStore utility
 */

import { EncryptedStore } from '../src/utils/encryptedStore.js';

// Mock crypto API for Node.js testing environment
global.crypto = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn()
  },
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random())
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn()
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

describe('EncryptedStore', () => {
  let store;

  beforeEach(() => {
    store = new EncryptedStore('test');
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with namespace', () => {
      expect(store.namespace).toBe('test');
      expect(store.keyCache).toBeInstanceOf(Map);
    });

    it('should use default namespace if none provided', () => {
      const defaultStore = new EncryptedStore();
      expect(defaultStore.namespace).toBe('default');
    });
  });

  describe('generateSalt', () => {
    it('should generate 32-byte salt', () => {
      const salt = store.generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(32);
    });
  });

  describe('deriveKey', () => {
    it('should derive key using PBKDF2', async () => {
      const mockKey = { type: 'secret' };
      const mockDerivedKey = { type: 'derived' };
      
      crypto.subtle.importKey.mockResolvedValue(mockKey);
      crypto.subtle.deriveKey.mockResolvedValue(mockDerivedKey);

      const password = 'test-password';
      const salt = new Uint8Array(32);
      
      const result = await store.deriveKey(password, salt);
      
      expect(crypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        mockKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      expect(result).toBe(mockDerivedKey);
    });
  });

  describe('encrypt', () => {
    it('should encrypt data with AES-GCM', async () => {
      const mockKey = { type: 'key' };
      const mockEncrypted = new ArrayBuffer(16);
      
      store.getKey = jest.fn().mockResolvedValue({ key: mockKey });
      crypto.subtle.encrypt.mockResolvedValue(mockEncrypted);

      const data = { test: 'data' };
      const result = await store.encrypt(data);

      expect(crypto.subtle.encrypt).toHaveBeenCalledWith(
        { name: 'AES-GCM', iv: expect.any(Uint8Array) },
        mockKey,
        expect.any(Uint8Array)
      );

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(Array.isArray(result.encrypted)).toBe(true);
      expect(Array.isArray(result.iv)).toBe(true);
    });
  });

  describe('decrypt', () => {
    it('should decrypt data', async () => {
      const mockKey = { type: 'key' };
      const mockDecrypted = new TextEncoder().encode(JSON.stringify({ test: 'data' }));
      
      store.getKey = jest.fn().mockResolvedValue({ key: mockKey });
      crypto.subtle.decrypt.mockResolvedValue(mockDecrypted);

      const encryptedData = {
        encrypted: [1, 2, 3, 4],
        iv: [5, 6, 7, 8]
      };

      const result = await store.decrypt(encryptedData);

      expect(crypto.subtle.decrypt).toHaveBeenCalledWith(
        { name: 'AES-GCM', iv: expect.any(Uint8Array) },
        mockKey,
        expect.any(Uint8Array)
      );

      expect(result).toEqual({ test: 'data' });
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data using localStorage fallback', async () => {
      const testData = { key: 'value', number: 42 };
      const encryptedData = { encrypted: [1, 2, 3], iv: [4, 5, 6] };
      
      store.encrypt = jest.fn().mockResolvedValue(encryptedData);
      store.decrypt = jest.fn().mockResolvedValue(testData);
      
      // Mock IndexedDB not available
      delete global.indexedDB;
      
      await store.set('testKey', testData);
      
      expect(store.encrypt).toHaveBeenCalledWith(testData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test:testKey',
        JSON.stringify(encryptedData)
      );

      localStorage.getItem.mockReturnValue(JSON.stringify(encryptedData));
      
      const result = await store.get('testKey');
      
      expect(localStorage.getItem).toHaveBeenCalledWith('test:testKey');
      expect(store.decrypt).toHaveBeenCalledWith(encryptedData);
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = await store.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle encryption errors gracefully', async () => {
      store.encrypt = jest.fn().mockRejectedValue(new Error('Encryption failed'));
      
      await expect(store.set('testKey', { data: 'test' })).rejects.toThrow('Encryption failed');
    });

    it('should handle decryption errors gracefully', async () => {
      const encryptedData = { encrypted: [1, 2, 3], iv: [4, 5, 6] };
      localStorage.getItem.mockReturnValue(JSON.stringify(encryptedData));
      store.decrypt = jest.fn().mockRejectedValue(new Error('Decryption failed'));
      
      const result = await store.get('testKey');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove data from localStorage', async () => {
      await store.remove('testKey');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test:testKey');
    });
  });

  describe('clear', () => {
    it('should clear all data for namespace from localStorage', async () => {
      Object.defineProperty(localStorage, 'keys', {
        value: jest.fn().mockReturnValue(['test:key1', 'test:key2', 'other:key3']),
        writable: true
      });

      // Mock Object.keys for localStorage
      Object.keys = jest.fn().mockReturnValue(['test:key1', 'test:key2', 'other:key3']);
      
      await store.clear();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('test:key1');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test:key2');
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other:key3');
    });
  });

  describe('key caching', () => {
    it('should cache derived keys', async () => {
      const mockKey = { type: 'key' };
      const mockSalt = new Uint8Array(32);
      
      store.deriveKey = jest.fn().mockResolvedValue(mockKey);
      store.generateSalt = jest.fn().mockReturnValue(mockSalt);

      // First call should derive key
      const result1 = await store.getKey();
      expect(store.deriveKey).toHaveBeenCalledTimes(1);
      expect(result1.key).toBe(mockKey);

      // Second call should use cached key
      const result2 = await store.getKey();
      expect(store.deriveKey).toHaveBeenCalledTimes(1); // Still only called once
      expect(result2.key).toBe(mockKey);
    });
  });
});