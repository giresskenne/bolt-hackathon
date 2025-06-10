/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – src/bg.js   (MV3 background Service Worker)
  • Static import of detectorWorker.js at initial eval
  • Then fetch patterns.json and call prepareDetector()
  • Replies to "scan" & "ping" messages
  • Injects CSS for rounded popup corners
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

// 4) Inject CSS for rounded popup corners when popup opens
chrome.action.onClicked.addListener(() => {
  // This will be called when the extension icon is clicked
  injectPopupStyles();
});

// Also inject styles when the extension starts up
chrome.runtime.onStartup.addListener(() => {
  injectPopupStyles();
});

chrome.runtime.onInstalled.addListener(() => {
  injectPopupStyles();
});

function injectPopupStyles() {
  try {
    // Inject CSS to make popup corners rounded
    const css = `
      html, body {
        border-radius: 12px !important;
        overflow: hidden !important;
        background: transparent !important;
      }
      
      .container {
        border-radius: 12px !important;
        overflow: hidden !important;
        background: #FFFFFF !important;
      }
    `;
    
    // Create a style element and inject it
    const style = document.createElement('style');
    style.textContent = css;
    
    // Try to inject into popup if it exists
    if (typeof document !== 'undefined') {
      document.head?.appendChild(style);
    }
    
    console.log('[Scrubber] Popup styles injected for rounded corners');
  } catch (error) {
    console.error('[Scrubber] Failed to inject popup styles:', error);
  }
}