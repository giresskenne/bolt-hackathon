/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – src/bg.js   (MV3 background Service Worker)
  • Static import of detectorWorker.js at initial eval
  • Then fetch patterns.json and call prepareDetector()
  • Replies to "scan" & "ping" messages
─────────────────────────────────────────────────────────────*/

'use strict';

// 1) static import at top‐level (allowed by MV3)
importScripts(chrome.runtime.getURL('src/detectorWorker.js'));
importScripts(chrome.runtime.getURL('src/encryptedStore.js'));
importScripts(chrome.runtime.getURL('src/quotaTracker.js'));

// 2) load the JSON manifest and initialize
const patternsURL = chrome.runtime.getURL('src/patterns.json');
fetch(patternsURL)
  .then(r => r.json())
  .then(({ identifiers }) => {
    self.prepareDetector(identifiers);
    console.log('[Scrubber] detector ready -', identifiers.length, 'patterns');
  })
  .catch(err => console.error('[Scrubber] failed to init detector', err));

// Initialize QuotaTracker
let quotaTracker;
try {
  quotaTracker = new self.QuotaTracker();
  console.log('[Scrubber] QuotaTracker initialized');
} catch (err) {
  console.error('[Scrubber] Failed to initialize QuotaTracker:', err);
}

// 3) handle incoming messages
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'scan') {
    sendResponse(self.scanDetector(msg.text || ''));
    return true;  // keep channel open for async reply
  }
  if (msg?.type === 'ping') {
    sendResponse({ ready: typeof self.scanDetector === 'function' });
    return true;
  }
  
  // Handle extension API requests
  if (msg?.type === 'extensionApi') {
    handleExtensionApiRequest(msg, sendResponse);
    return true; // Keep channel open for async response
  }
});

// Handle extension API requests from web app
async function handleExtensionApiRequest(msg, sendResponse) {
  try {
    if (!quotaTracker) {
      throw new Error('QuotaTracker not initialized');
    }

    const { action, data } = msg;
    let result;

    switch (action) {
      case 'getUsage':
        result = await quotaTracker.getCurrentUsage();
        break;
      
      case 'getCustomRules':
        // Read custom rules from sync storage (updated via popup), fallback to encrypted store
        try {
          const syncData = await chrome.storage.sync.get(['customRules']);
          result = syncData.customRules || [];
        } catch {
          result = await quotaTracker.getCustomRules();
        }
        break;

      // Alias for scrub history
      case 'getHistory':
        result = await quotaTracker.getScrubHistory(data?.limit);
        break;

      case 'getScrubHistory':
        result = await quotaTracker.getScrubHistory(data?.limit);
        break;
        
      case 'addCustomRule':
        result = await quotaTracker.addCustomRule(data);
        break;
        
      case 'updateCustomRule':
        result = await quotaTracker.updateCustomRule(data.id, data.updates);
        break;
        
      case 'deleteCustomRule':
        result = await quotaTracker.deleteCustomRule(data.id);
        break;
        
      case 'addScrubEvent':
        result = await quotaTracker.addScrubEvent(data);
        break;
        
      case 'updatePlan':
        result = await quotaTracker.updatePlan(data.plan);
        break;
        
      case 'exportData':
        result = await quotaTracker.exportData();
        break;
        
      case 'clearAllData':
        result = await quotaTracker.clearAllData();
        break;
        
      case 'canPerformAction':
        result = await quotaTracker.canPerformAction(data.action);
        break;
        
      case 'getUsagePercentage':
        result = await quotaTracker.getUsagePercentage(data.type);
        break;

      // Batch snapshot for dashboard to reduce IPC
      case 'getDashboardSnapshot':
        // Gather usage, rules, and history in one go
        result = {
          usage: await quotaTracker.getCurrentUsage(),
          customRules: await quotaTracker.getCustomRules(),
          scrubHistory: await quotaTracker.getScrubHistory(data?.limit || 20)
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log the response for debugging
    console.log('[BG] responding to action', action, 'with', result);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[Scrubber] Extension API error:', error);
    sendResponse({ success: false, error: error.message });
  }
}