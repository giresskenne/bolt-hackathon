/**
 * Extension API - Communication utility for web app to extension
 */

class ExtensionApi {
  constructor() {
    this.extensionId = null;
    this.isReady = false;
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    
    // Listen for extension messages
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Check if extension is already ready
    this.checkExtensionReady();
  }

  handleMessage(event) {
    if (event.data?.type === 'EXTENSION_READY') {
      this.extensionId = event.data.extensionId;
      this.isReady = true;
      console.log('[ExtensionApi] Extension ready:', this.extensionId);
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

  checkExtensionReady() {
    // Send a ping to see if extension is already loaded
    console.log('[ExtensionApi] Checking if extension is ready...');
    window.postMessage({
      type: 'EXTENSION_PING'
    }, window.location.origin);
    
    // Also listen for any existing EXTENSION_READY messages
    setTimeout(() => {
      if (!this.isReady) {
        console.log('[ExtensionApi] Extension not detected after initial check');
      }
    }, 1000);
  }

  async sendRequest(action, data = null, timeout = 5000) {
    if (!this.isReady) {
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
    return this.isReady;
  }

  getExtensionId() {
    return this.extensionId;
  }
}

// Create singleton instance
const extensionApi = new ExtensionApi();

export default extensionApi;