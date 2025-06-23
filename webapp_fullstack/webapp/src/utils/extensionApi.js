/**
 * Extension API - Communication utility for web app to extension
 */

class ExtensionApi {
  constructor() {
    this.extensionId = null;
    this.readyPromise = null;
    this.readyResolve = null;
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    
    // Create a promise that resolves when extension is ready
    this.createReadyPromise();
    
    // Listen for extension messages
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Check if extension is already ready
    this.checkExtensionReady();
  }

  createReadyPromise() {
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  handleMessage(event) {
    if (event.data?.type === 'EXTENSION_READY') {
      this.extensionId = event.data.extensionId;
      console.log('[ExtensionApi] Extension ready:', this.extensionId);
      
      // Resolve the ready promise
      if (this.readyResolve) {
        this.readyResolve(true);
        this.readyResolve = null;
      }
    }
    
    if (event.data?.type === 'EXTENSION_API_RESPONSE') {
      const { requestId, success, data, error } = event.data;
      const pendingRequest = this.pendingRequests.get(requestId);
      
      if (pendingRequest) {
        this.pendingRequests.delete(requestId);
        
        if (success) {
          pendingRequest.resolve(data);
        } else {
          pendingRequest.reject(new Error(error || 'Extension API request failed'));
        }
      }
    }
  }

  async checkExtensionReady() {
    // Send a ping to see if extension is already loaded
    console.log('[ExtensionApi] Checking if extension is ready...');
    window.postMessage({
      type: 'EXTENSION_PING'
    }, window.location.origin);
    
    // Set a timeout for the readiness check
    setTimeout(() => {
      if (this.readyResolve) {
        console.log('[ExtensionApi] Extension not detected after timeout');
        this.readyResolve(false);
        this.readyResolve = null;
      }
    }, 5000); // 5 second timeout for extension detection
  }

  async waitForReady(timeout = 5000) {
    // If already resolved, return immediately
    if (this.extensionId) {
      return true;
    }

    // Race between ready promise and timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(false), timeout);
    });

    return Promise.race([this.readyPromise, timeoutPromise]);
  }

  async sendRequest(action, data = null, timeout = 10000) {
    // Wait for extension to be ready before sending any requests
    const isReady = await this.waitForReady(5000);
    
    if (!isReady) {
      throw new Error('Extension not ready. Please install and enable the Prompt-Scrubber extension.');
    }

    const requestId = `req_${++this.requestCounter}_${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Extension API request timeout'));
      }, timeout);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve: (data) => {
          clearTimeout(timeoutId);
          resolve(data);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      // Send request to extension
      window.postMessage({
        type: 'EXTENSION_API_REQUEST',
        action,
        data,
        requestId
      }, '*');
    });
  }

  // Usage and quota methods
  async getUsage() {
    return this.sendRequest('getUsage');
  }

  async canPerformAction(action) {
    return this.sendRequest('canPerformAction', { action });
  }

  async getUsagePercentage(type) {
    return this.sendRequest('getUsagePercentage', { type });
  }

  async updatePlan(plan) {
    return this.sendRequest('updatePlan', { plan });
  }

  // Custom rules methods
  async getCustomRules() {
    return this.sendRequest('getCustomRules');
  }

  async addCustomRule(rule) {
    return this.sendRequest('addCustomRule', rule);
  }

  async updateCustomRule(id, updates) {
    return this.sendRequest('updateCustomRule', { id, updates });
  }

  async deleteCustomRule(id) {
    return this.sendRequest('deleteCustomRule', { id });
  }

  // Scrub history methods
  async getScrubHistory(limit = 20) {
    return this.sendRequest('getScrubHistory', { limit });
  }

  async addScrubEvent(event) {
    return this.sendRequest('addScrubEvent', event);
  }

  // Data management methods
  async exportData() {
    return this.sendRequest('exportData');
  }

  async clearAllData() {
    return this.sendRequest('clearAllData');
  }

  // Utility methods
  isExtensionReady() {
    return !!this.extensionId;
  }

  getExtensionId() {
    return this.extensionId;
  }

  // Reset the ready state (useful for testing or reconnection)
  reset() {
    this.extensionId = null;
    this.createReadyPromise();
    this.pendingRequests.clear();
  }
}

// Create singleton instance
const extensionApi = new ExtensionApi();

export default extensionApi;