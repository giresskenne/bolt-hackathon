/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – contentScript.js  (v0.3.0)
  ▸ Enhanced with sensitive text underlining:
      • Adds "Scrub" button to hide sensitive data
      • Visual feedback before scrubbing with subtle highlighting
      • Preserves all original scrubbing functionality
─────────────────────────────────────────────────────────────*/

/* async helper – background returns [{start,end}]  (still available) */
const detectSensitive = text =>
  new Promise(res => chrome.runtime.sendMessage({ type: 'scan', text }, res));

/* tiny utilities */
const isTextInput = el =>
  el && (el.tagName === 'TEXTAREA' || el.isContentEditable ||
         el.getAttribute('role') === 'textbox');

/* toast */
function toast(msg){
  const n = Object.assign(document.body.appendChild(document.createElement('div')), {
    textContent: msg,
    style:'position:fixed;bottom:120px;right:24px;padding:8px 12px;'+
          'background:#111;color:#fff;border-radius:6px;font:14px/1 sans-serif;'+
          'z-index:9999;opacity:0;transition:opacity .3s;'
  });
  requestAnimationFrame(()=>n.style.opacity='0.9');
  setTimeout(()=>{n.style.opacity='0'; setTimeout(()=>n.remove(),300);},2500);
}

/* helper to get & set raw text preserving formatting */
function getRaw(el){
  return el.tagName==='TEXTAREA' ? el.value : el.innerText;
}

function getTextAreaBounds(el) {
  // Get the actual input area bounds, handling both textarea and contenteditable
  const rect = el.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(el);
  
  return {
    bottom: rect.bottom - parseInt(computedStyle.paddingBottom || 0),
    left: rect.left + parseInt(computedStyle.paddingLeft || 0),
    width: rect.width,
    height: rect.height
  };
}

function cleanupExistingButtons() {
  // Remove any existing buttons
  Array.from(activeButtons).forEach(button => {
    button.remove();
    activeButtons.delete(button);
  });

  // Clean up any styling we added
  if (lastActive) {
    // Clean the textarea
    lastActive.style.marginBottom = '';
    lastActive.style.position = '';
    lastActive.style.background = ''; // Clear any highlighting
    
    // Clean the parent if needed
    if (lastActive.parentElement) {
      lastActive.parentElement.style.position = '';
      lastActive.parentElement.style.paddingBottom = '';
    }
  }
}

function setRaw(el, txt) {
  if (el.tagName === 'TEXTAREA') {
    // For textarea elements, use the standard approach
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, txt);
    el.dispatchEvent(new Event('input', {bubbles: true}));
  } else {
    // For contenteditable elements, we need to be more careful
    // Store cursor position
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const cursorOffset = range ? range.startOffset : 0;
    
    // Get the current text node that contains the cursor
    let currentNode = null;
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
      currentNode = range.startContainer;
    }
    
    // Simple approach: replace the entire text content
    // This works better for complex cases like JSON strings
    const oldText = el.innerText;
    el.innerText = txt;
    
    // Try to restore cursor position
    if (currentNode && el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
      try {
        const newRange = document.createRange();
        const textNode = el.firstChild;
        const newOffset = Math.min(cursorOffset, textNode.textContent.length);
        newRange.setStart(textNode, newOffset);
        newRange.setEnd(textNode, newOffset);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        // If cursor restoration fails, just continue
        console.debug('[Scrubber] Could not restore cursor position:', e);
      }
    }
    
    // Trigger input event to notify the application
    el.dispatchEvent(new Event('input', {bubbles: true}));
    
    // Also trigger other events that some applications might listen for
    el.dispatchEvent(new Event('change', {bubbles: true}));
    el.dispatchEvent(new Event('keyup', {bubbles: true}));
  }
}

/* Enhanced theme detection function with automatic updates */
function getThemeAwareBackground() {
  // Primary detection: system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Secondary detection: check DOM for dark mode indicators
  const bodyClasses = document.body.className.toLowerCase();
  const htmlClasses = document.documentElement.className.toLowerCase();
  const bodyStyle = window.getComputedStyle(document.body);
  const htmlStyle = window.getComputedStyle(document.documentElement);
  
  // Check for common dark mode class patterns
  const hasDarkClass = bodyClasses.includes('dark') || 
                       htmlClasses.includes('dark') ||
                       bodyClasses.includes('theme-dark') ||
                       htmlClasses.includes('theme-dark') ||
                       bodyClasses.includes('dark-mode') ||
                       htmlClasses.includes('dark-mode');
  
  // Check background colors to detect dark themes
  const bodyBg = bodyStyle.backgroundColor;
  const htmlBg = htmlStyle.backgroundColor;
  
  // Parse RGB values to detect dark backgrounds
  const isDarkBackground = (bgColor) => {
    if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') return false;
    
    const rgb = bgColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const [r, g, b] = rgb.map(Number);
      // Calculate luminance - if it's low, it's a dark background
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    return false;
  };
  
  const isDarkMode = prefersDark || 
                     hasDarkClass || 
                     isDarkBackground(bodyBg) || 
                     isDarkBackground(htmlBg);
  
  console.log('[Scrubber] Theme detection:', {
    prefersDark,
    hasDarkClass,
    bodyBg,
    htmlBg,
    isDarkMode
  });
  
  // Return appropriate gradient based on theme
  if (isDarkMode) {
    return 'linear-gradient(90deg, #2a2a2a 0%, #3a1a1a 100%)';
  } else {
    return 'linear-gradient(90deg, #fff 0%, #fff5f5 100%)';
  }
}

// Set up theme change listener for automatic updates
let themeMediaQuery = null;

function setupThemeListener() {
  // Listen for system theme changes
  if (window.matchMedia) {
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e) => {
      console.log('[Scrubber] System theme changed to:', e.matches ? 'dark' : 'light');
      // Re-apply highlighting to current active element if any
      if (lastActive && scrubberEnabled) {
        autoHighlightSensitive(lastActive);
      }
    };
    
    // Modern browsers
    if (themeMediaQuery.addEventListener) {
      themeMediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // Fallback for older browsers
      themeMediaQuery.addListener(handleThemeChange);
    }
  }
  
  // Also listen for class changes on body/html that might indicate theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
        // Debounce theme updates
        clearTimeout(observer.themeTimeout);
        observer.themeTimeout = setTimeout(() => {
          if (lastActive && scrubberEnabled) {
            autoHighlightSensitive(lastActive);
          }
        }, 100);
      }
    });
  });
  
  observer.observe(document.body, { 
    attributes: true, 
    attributeFilter: ['class', 'style'] 
  });
  
  observer.observe(document.documentElement, { 
    attributes: true, 
    attributeFilter: ['class', 'style'] 
  });
}

/* main input handler */
let lastActive = null;
let underlineState = new Map();
let scrubberEnabled = true;
let customRules = [];
let activeButtons = new Set();

// Initialize state
async function initializeState() {
  console.log('[Scrubber] Initializing content script state...');
  try {
    const syncData = await chrome.storage.sync.get(['enabled', 'customRules']);
    scrubberEnabled = syncData.hasOwnProperty('enabled') ? syncData.enabled : true;
    customRules = syncData.customRules || [];
    console.log('[Scrubber] Loaded from sync storage - enabled:', scrubberEnabled, 'rules:', customRules.length);
  } catch (error) {
    console.log('[Scrubber] Falling back to local storage');
    const localData = await chrome.storage.local.get(['enabled', 'customRules']);
    scrubberEnabled = localData.hasOwnProperty('enabled') ? localData.enabled : true;
    customRules = localData.customRules || [];
    console.log('[Scrubber] Loaded from local storage - enabled:', scrubberEnabled, 'rules:', customRules.length);
  }
  
  // Set up theme change listener
  setupThemeListener();
}

initializeState();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log('[Scrubber] Received message:', msg);
  
  if (msg?.action === 'setState' && typeof msg.enabled === 'boolean') {
    console.log('[Scrubber] Setting enabled state to:', msg.enabled);
    scrubberEnabled = msg.enabled;
    
    // When disabled, clean up everything immediately
    if (!scrubberEnabled) {
      cleanupExistingButtons();
      // Clear highlighting from all text inputs on the page
      document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]').forEach(el => {
        el.style.background = '';
        el.style.marginBottom = '';
        el.style.paddingBottom = '';
      });
      lastActive = null;
    } else {
      // When re-enabled, check current active element
      if (lastActive) {
        handleTextInput({ target: lastActive });
      }
    }
    
    sendResponse({ success: true, enabled: scrubberEnabled });
    return true;
  }
  
  if (msg?.action === 'updateCustomRules' && Array.isArray(msg.rules)) {
    console.log('[Scrubber] Updating custom rules:', msg.rules.length);
    customRules = msg.rules;
    if (lastActive && scrubberEnabled) autoHighlightSensitive(lastActive);
    sendResponse({ success: true, rulesCount: customRules.length });
    return true;
  }
  
  // Send back current state if requested
  if (msg?.action === 'getState') {
    sendResponse({ enabled: scrubberEnabled, rulesCount: customRules.length });
    return true;
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('[Scrubber] Storage changed:', changes, 'namespace:', namespace);
  
  if ((namespace === 'sync' || namespace === 'local') && changes.enabled) {
    const newEnabled = changes.enabled.newValue;
    console.log('[Scrubber] Enabled state changed to:', newEnabled);
    scrubberEnabled = newEnabled;
    
    // When disabled, clean up everything immediately
    if (!scrubberEnabled) {
      cleanupExistingButtons();
      // Clear highlighting from all text inputs on the page
      document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]').forEach(el => {
        el.style.background = '';
        el.style.marginBottom = '';
        el.style.paddingBottom = '';
      });
      lastActive = null;
    } else {
      // When re-enabled, check current active element
      if (lastActive) {
        handleTextInput({ target: lastActive });
      }
    }
  }
  
  if ((namespace === 'sync' || namespace === 'local') && changes.customRules) {
    const newRules = changes.customRules.newValue || [];
    console.log('[Scrubber] Custom rules changed:', newRules.length);
    customRules = newRules;
    if (lastActive && scrubberEnabled) autoHighlightSensitive(lastActive);
  }
});

function injectScrubButton(el) {
  // Don't inject button if scrubber is disabled
  if (!scrubberEnabled) {
    return;
  }
  
  // Clean up any existing buttons first
  cleanupExistingButtons();
  
  // Create container for button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'scrub-button-container';
  
  const host = window.location.hostname;
  
  // Platform-specific handling
  if (host.includes('claude.ai') || host.includes('gemini.google.com')) {
    // For Claude and Gemini, position relative to textarea's parent
    const wrapper = el.parentElement;
    wrapper.style.position = 'relative';
    wrapper.style.paddingBottom = '40px';
    
    buttonContainer.style.cssText = `
      position: absolute;
      z-index: 10000;
      bottom: 8px;
      left: 8px;
    `;
    
    wrapper.appendChild(buttonContainer);
  } else {
    // For ChatGPT, Copilot and others, position relative to textarea
    el.style.position = 'relative';
    el.style.marginBottom = '40px';
    
    buttonContainer.style.cssText = `
      position: absolute;
      z-index: 10000;
      bottom: 8px;
      left: 8px;
      pointer-events: auto;
    `;
    
    // Add directly to parent without wrapping
    el.parentElement.appendChild(buttonContainer);
  }
  
  // Scrub button - Updated logo path for dist structure
  const scrubBtn = document.createElement('button');
  scrubBtn.className = 'scrub-button';
  scrubBtn.type = 'button';
  scrubBtn.innerHTML = `<img src="${chrome.runtime.getURL('icons/Logo.png')}" width="16" height="16" style="vertical-align:middle;margin-right:4px"> Scrub`;
  scrubBtn.style.cssText = `
    padding: 2px 8px;
    font-size: 13px;
    border: 1px solid #e0e0e0;
    border-radius: 15px;
    background: #fff;
    color: #333;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    white-space: nowrap;
  `;
  
  scrubBtn.onmouseover = () => {
    scrubBtn.style.background = '#f5f5f5';
  };
  
  scrubBtn.onmouseout = () => {
    scrubBtn.style.background = '#fff';
  };
  
  scrubBtn.onclick = () => {
    scrubText(el);
    autoHighlightSensitive(el); // Re-check for sensitive data after scrubbing
  };
  
  buttonContainer.appendChild(scrubBtn);
  el.parentElement.appendChild(buttonContainer);
  activeButtons.add(buttonContainer);

  // Clean up when element is removed
  const observer = new MutationObserver(() => {
    if (!document.contains(el)) {
      buttonContainer.remove();
      activeButtons.delete(buttonContainer);
      // Reset both margin and padding when button is removed
      el.style.marginBottom = '';
      el.style.paddingBottom = '';
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Handle input and paste events
const handleTextInput = (e) => {
  // CRITICAL: If scrubber is disabled, do nothing at all
  if (!scrubberEnabled || !isTextInput(e.target)) {
    return;
  }
  
  const el = e.target;
  const text = getRaw(el);
  
  if (!text.trim()) {
    cleanUp(el);
    return;
  }
  
  // Always clean up existing buttons first
  cleanupExistingButtons();
  
  // Then inject a new button
  lastActive = el;
  injectScrubButton(el);
  
  // Check for sensitive content
  autoHighlightSensitive(el);
};

// Handle input, paste, and focus events
document.addEventListener('input', handleTextInput, true);
document.addEventListener('paste', handleTextInput, true);
document.addEventListener('focus', (e) => {
  if (isTextInput(e.target)) {
    const text = getRaw(e.target);
    if (text.trim()) {
      handleTextInput(e);
    }
  }
}, true);

// Automatically highlight sensitive info with theme-aware background
async function autoHighlightSensitive(el) {
  // CRITICAL: If scrubber is disabled, clear any highlighting and return IMMEDIATELY
  if (!scrubberEnabled) {
    if (el) {
      el.style.background = '';
      el.style.marginBottom = '';
      el.style.paddingBottom = '';
    }
    return;
  }
  
  // If no element provided, also return
  if (!el) {
    return;
  }
  
  const text = getRaw(el);
  if (!text.trim()) {
    el.style.background = '';
    // Reset both margin and padding when no text
    el.style.marginBottom = '';
    el.style.paddingBottom = '';
    return;
  }

  // Only run detection if scrubber is enabled (this check is now redundant but kept for safety)
  const { clean, stats } = self.PromptScrubberRedactor.redact(text, customRules);
  const totalSensitive = Object.values(stats).reduce((a,b)=>a+b,0);
  
  // Apply highlighting only if sensitive data is found
  if (totalSensitive > 0) {
    // Use smart theme detection for background
    el.style.background = getThemeAwareBackground();
  } else {
    el.style.background = '';
  }
}

/* scrub core */
function scrubText(target) {
  // CRITICAL: If scrubber is disabled, show message and return
  if (!scrubberEnabled) {
    toast('Scrubber is disabled. Enable it in the extension popup.');
    return;
  }
  
  if (!target) return;
  
  const raw = getRaw(target);
  console.log('[Scrubber] Original text:', raw);
  
  const { clean, stats } = self.PromptScrubberRedactor.redact(raw, customRules);
  console.log('[Scrubber] Redacted text:', clean);
  console.log('[Scrubber] Stats:', stats);
  
  const totalMasked = Object.values(stats).reduce((a,b)=>a+b,0);
  
  if (totalMasked > 0) {
    setRaw(target, clean);
    target.style.background = ''; // Remove highlighting after scrubbing
    toast(`${totalMasked} sensitive item${totalMasked>1?'s':''} masked`);
    
    // Send message to popup to increment the masked count
    // Use both chrome.runtime.sendMessage (for popup) and storage (for persistence)
    console.log('[Scrubber] Sending increment message for', totalMasked, 'items');
    
    // First, update local storage directly (this ensures persistence)
    chrome.storage.local.get('maskedCount').then(result => {
      const currentCount = result.maskedCount || 0;
      const newCount = currentCount + totalMasked;
      chrome.storage.local.set({ maskedCount: newCount });
      console.log('[Scrubber] Updated masked count from', currentCount, 'to', newCount);
    }).catch(error => {
      console.error('[Scrubber] Error updating masked count in storage:', error);
    });
    
    // Then try to notify popup if it's open
    chrome.runtime.sendMessage({
      action: 'incrementMaskedCount',
      count: totalMasked
    }).then(response => {
      console.log('[Scrubber] Popup responded:', response);
    }).catch(error => {
      // This is expected when popup is closed
      console.debug('[Scrubber] Could not send message to popup (popup may be closed):', error.message);
    });
  } else {
    toast('No sensitive items detected');
  }
  
  if(!clean.trim()) cleanUp(target);
}

/* clean-up when box is emptied */
function cleanUp(el) {
  const buttonContainer = el.parentElement.querySelector('.scrub-button-container');
  if (buttonContainer) {
    buttonContainer.remove();
    activeButtons.delete(buttonContainer);
  }
  lastActive = null;
  el.style.background = '';
  // Reset both margin and padding when cleaning up
  el.style.marginBottom = '';
  el.style.paddingBottom = '';
}

// Remove highlighting when text is empty
document.addEventListener('input', e => {
  if (!isTextInput(e.target)) return;
  const el = e.target;
  if (!getRaw(el).trim()) {
    el.style.background = '';
    // Reset both margin and padding when text is empty
    el.style.marginBottom = '';
    el.style.paddingBottom = '';
  }
}, true);

// Listen for keyboard shortcut (Alt+Shift+S)
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    
    // CRITICAL: Check if scrubber is enabled before processing shortcut
    if (!scrubberEnabled) {
      toast('Scrubber is disabled. Enable it in the extension popup.');
      return;
    }
    
    // Find the currently focused text input
    const activeElement = document.activeElement;
    if (isTextInput(activeElement)) {
      scrubText(activeElement);
      autoHighlightSensitive(activeElement);
    } else {
      // If no text input is focused, try to find the last active one
      if (lastActive && document.contains(lastActive)) {
        scrubText(lastActive);
        autoHighlightSensitive(lastActive);
      } else {
        toast('No active text field found');
      }
    }
  }
});

// Web app communication bridge
// Listen for messages from web application
window.addEventListener('message', async (event) => {
  // Only accept messages from same origin or allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://prompt-scrubber.com'
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    return;
  }
  
  // Handle extension ping requests
  if (event.data?.type === 'EXTENSION_PING') {
    // Respond immediately that extension is ready
    window.postMessage({
      type: 'EXTENSION_READY',
      extensionId: chrome.runtime.id
    }, event.origin);
    return;
  }
  
  if (event.data?.type === 'EXTENSION_API_REQUEST') {
    try {
      // Forward request to background script
      const response = await chrome.runtime.sendMessage({
        type: 'extensionApi',
        action: event.data.action,
        data: event.data.data,
        requestId: event.data.requestId
      });
      
      // Send response back to web app
      window.postMessage({
        type: 'EXTENSION_API_RESPONSE',
        requestId: event.data.requestId,
        success: response.success,
        data: response.data,
        error: response.error
      }, event.origin);
      
    } catch (error) {
      console.error('[Scrubber] Content script bridge error:', error);
      
      // Send error response back to web app
      window.postMessage({
        type: 'EXTENSION_API_RESPONSE',
        requestId: event.data.requestId,
        success: false,
        error: error.message
      }, event.origin);
    }
  }
});

// Notify web app that extension is ready
window.postMessage({
  type: 'EXTENSION_READY',
  extensionId: chrome.runtime.id
}, '*');