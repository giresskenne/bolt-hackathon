/**
 * Main content script that initializes the Prompt-Scrubber functionality
 */
(function() {
  // Initialize the pattern detector with the configuration
  const patternDetector = new PatternDetector(CONFIG);
  
  // Initialize the element observer
  const elementObserver = new ElementObserver(CONFIG, patternDetector);
  
  // Check for stored enabled state
  chrome.storage.sync.get('enabled', result => {
    // If there's a stored preference, use it; otherwise use the default
    const enabled = result.hasOwnProperty('enabled') ? result.enabled : CONFIG.enabled;
    patternDetector.setEnabled(enabled);
    
    // Initialize observers after setting the enabled state
    elementObserver.init();
  });
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getState') {
      sendResponse({ enabled: patternDetector.enabled });
    } else if (message.action === 'setState') {
      patternDetector.setEnabled(message.enabled);
      sendResponse({ success: true });
    }
    return true;
  });
})();