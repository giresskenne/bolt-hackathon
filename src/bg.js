/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – src/bg.js   (MV3 background Service Worker)
  • Static import of detectorWorker.js at initial eval
  • Then fetch patterns.json and call prepareDetector()
  • Replies to "scan" & "ping" messages
  • Handles popup injection for rounded corners
─────────────────────────────────────────────────────────────*/

'use strict';

// 1) static import at top‐level (allowed by MV3)
importScripts(chrome.runtime.getURL('src/detectorWorker.js'));

// 2) load the JSON manifest and initialize
const patternsURL = chrome.runtime.getURL('src/patterns.json');
fetch(patternsURL)
  .then(r => r.json())
  .then(({ identifiers }) => {
    self.prepareDetector(identifiers);
    console.log('[Scrubber] detector ready -', identifiers.length, 'patterns');
  })
  .catch(err => console.error('[Scrubber] failed to init detector', err));

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
});

// 4) Handle extension icon click to inject rounded popup
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Scrubber] Extension icon clicked, injecting rounded popup');
  
  try {
    // Get the current tab ID
    const tabId = tab.id;
    
    // Inject the rounded popup content script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['src/roundedPopup.js']
    });
    
    console.log(`[Scrubber] Rounded popup injected into tab ${tabId}`);
  } catch (error) {
    console.error('[Scrubber] Error injecting rounded popup:', error);
  }
});