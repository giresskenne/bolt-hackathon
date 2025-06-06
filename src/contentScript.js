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
function setRaw(el,txt){
  if(el.tagName==='TEXTAREA'){
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,txt);
    el.dispatchEvent(new Event('input',{bubbles:true}));
  }else{
    el.innerText = txt;
  }
}

/* main input handler */
let lastActive = null;
let underlineState = new Map();
let scrubberEnabled = true;
let customRules = [];
let activeButtons = new Set();

// Initialize state
async function initializeState() {
  try {
    const syncData = await chrome.storage.sync.get(['enabled', 'customRules']);
    scrubberEnabled = syncData.hasOwnProperty('enabled') ? syncData.enabled : true;
    customRules = syncData.customRules || [];
  } catch (error) {
    console.log('[Scrubber] Falling back to local storage');
    const localData = await chrome.storage.local.get(['enabled', 'customRules']);
    scrubberEnabled = localData.hasOwnProperty('enabled') ? localData.enabled : true;
    customRules = localData.customRules || [];
  }
}

initializeState();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.action === 'setState' && typeof msg.enabled === 'boolean') {
    scrubberEnabled = msg.enabled;
    if (lastActive) autoHighlightSensitive(lastActive);
  }
  if (msg?.action === 'updateCustomRules' && Array.isArray(msg.rules)) {
    customRules = msg.rules;
    if (lastActive) autoHighlightSensitive(lastActive);
  }
});

function injectScrubButton(el) {
  // Remove existing button if any
  const existingContainer = el.parentElement.querySelector('.scrub-button-container');
  if (existingContainer) existingContainer.remove();
  
  // Create container for button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'scrub-button-container';
  buttonContainer.style.cssText = `
    position: absolute;
    z-index: 10000;
    margin: 4px;
  `;

  // Position the container based on the platform
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const host = window.location.hostname;

  // Default positioning (bottom-left)
  buttonContainer.style.bottom = '10px';
  buttonContainer.style.left = '10px';

  // Platform-specific adjustments
  if (host.includes('perplexity.ai')) {
    el.parentElement.style.position = 'relative';
  }
  
  // Add margin to textarea
  el.style.marginBottom = '45px';
  
  // Scrub button
  const scrubBtn = document.createElement('button');
  scrubBtn.className = 'scrub-button';
  scrubBtn.type = 'button';
  scrubBtn.innerHTML = `<img src="${chrome.runtime.getURL('icons/logo.png')}" width="16" height="16" style="vertical-align:middle;margin-right:4px"> Scrub`;
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
      el.style.marginBottom = ''; // Reset margin when button is removed
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Handle input events
document.addEventListener('input', e => {
  if (!scrubberEnabled || !isTextInput(e.target)) return;
  
  const el = e.target;
  const text = getRaw(el);
  
  if (!text.trim()) {
    cleanUp(el);
    return;
  }
  
  // Only inject button if it doesn't exist
  if (!el.parentElement.querySelector('.scrub-button-container')) {
    lastActive = el;
    injectScrubButton(el);
  }
  
  autoHighlightSensitive(el);
}, true);

// Automatically highlight sensitive info
async function autoHighlightSensitive(el) {
  if (!scrubberEnabled || !el) return;
  
  const text = getRaw(el);
  if (!text.trim()) {
    el.style.background = '';
    el.style.marginBottom = ''; // Reset margin when no text
    return;
  }

  const { clean, stats } = self.PromptScrubberRedactor.redact(text, customRules);
  const totalSensitive = Object.values(stats).reduce((a,b)=>a+b,0);
  
  // Apply highlighting only if sensitive data is found
  if (totalSensitive > 0) {
    const host = window.location.hostname;
    if (host.includes('chat.openai.com')) {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #fff5f5 100%)';
    } else if (host.includes('claude.ai')) {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #fff5f5 100%)';
    } else {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #fff5f5 100%)';
    }
  } else {
    el.style.background = '';
  }
}

/* scrub core */
function scrubText(target) {
  if (!scrubberEnabled || !target) return;
  
  const raw = getRaw(target);
  const { clean, stats } = self.PromptScrubberRedactor.redact(raw, customRules);
  const totalMasked = Object.values(stats).reduce((a,b)=>a+b,0);
  
  setRaw(target, clean);
  target.style.background = ''; // Remove highlighting after scrubbing
  
  toast(totalMasked ? `${totalMasked} sensitive item${totalMasked>1?'s':''} masked` : 'No sensitive items detected');
  
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
  el.style.marginBottom = ''; // Reset margin when cleaning up
}

// Remove highlighting when text is empty
document.addEventListener('input', e => {
  if (!isTextInput(e.target)) return;
  const el = e.target;
  if (!getRaw(el).trim()) {
    el.style.background = '';
    el.style.marginBottom = ''; // Reset margin when text is empty
  }
}, true);