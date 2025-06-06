/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – contentScript.js  (v0.3.0)
  ▸ Enhanced with sensitive text underlining:
      • Adds "Underline Sensitive" button to highlight sensitive data
      • Visual feedback before scrubbing with red underlines
      • Toggle functionality to show/hide underlines
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
    el.innerText = txt; // keeps newline → <div>/<br> structure
  }
}

/* main input handler */
let lastActive = null;
let underlineState = new Map(); // Track underline state per element
let scrubberEnabled = true;
let customRules = []; // Store custom rules

// Initialize: get enabled state and custom rules from both sync and local storage
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
  console.log('[Scrubber] Initialized with', customRules.length, 'custom rules');
}

// Initialize state
initializeState();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.action === 'setState' && typeof msg.enabled === 'boolean') {
    scrubberEnabled = msg.enabled;
    if (lastActive) autoHighlightSensitive(lastActive);
  }
  if (msg?.action === 'updateCustomRules' && Array.isArray(msg.rules)) {
    customRules = msg.rules;
    console.log('[Scrubber] Updated custom rules:', customRules.length);
    if (lastActive) autoHighlightSensitive(lastActive);
  }
});

function injectScrubButton(el) {
  // Remove existing button if any
  const existingContainer = el.parentElement.querySelector('.scrub-button-container');
  if (existingContainer) existingContainer.remove();
  
  // Create container for buttons with fixed positioning
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'scrub-button-container';
  buttonContainer.style.cssText = `
    position: absolute;
    display: inline-flex;
    gap: 4px;
    margin: 2px 8px;
    z-index: 10000;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 4px;
  `;

  // Position the container based on the textarea
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Adjust position based on the platform
  const host = window.location.hostname;
  if (host.includes('stackoverflow.com')) {
    buttonContainer.style.top = `${rect.top + scrollTop + 5}px`;
    buttonContainer.style.right = `${window.innerWidth - rect.right + 5}px`;
  } else if (host.includes('perplexity.ai')) {
    buttonContainer.style.top = `${rect.top + scrollTop + 5}px`;
    buttonContainer.style.right = '10px';
  } else {
    // Default positioning for other platforms
    buttonContainer.style.top = `${rect.top + scrollTop + 5}px`;
    buttonContainer.style.right = `${window.innerWidth - rect.right + 5}px`;
  }
  
  // Scrub button
  const scrubBtn = document.createElement('button');
  scrubBtn.className = 'scrub-button';
  scrubBtn.type = 'button';
  scrubBtn.innerHTML = `<img src="${chrome.runtime.getURL('icons/logo.png')}" width="16" height="16" style="vertical-align:middle;margin-right:4px"> Scrub`;
  scrubBtn.style.cssText = `
    padding: 4px 12px;
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
    min-width: 80px;
    height: 28px;
  `;
  
  scrubBtn.onmouseover = () => {
    scrubBtn.style.background = '#f5f5f5';
    scrubBtn.style.borderColor = '#ccc';
  };
  
  scrubBtn.onmouseout = () => {
    scrubBtn.style.background = '#fff';
    scrubBtn.style.borderColor = '#e0e0e0';
  };
  
  scrubBtn.onclick = () => scrubText(el);
  
  buttonContainer.appendChild(scrubBtn);
  document.body.appendChild(buttonContainer);
  
  // Update button position on scroll and resize
  const updatePosition = () => {
    const newRect = el.getBoundingClientRect();
    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    buttonContainer.style.top = `${newRect.top + newScrollTop + 5}px`;
    buttonContainer.style.right = `${window.innerWidth - newRect.right + 5}px`;
  };
  
  window.addEventListener('scroll', updatePosition);
  window.addEventListener('resize', updatePosition);
  
  // Clean up event listeners when the element is removed
  const observer = new MutationObserver((mutations) => {
    if (!document.contains(el)) {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      buttonContainer.remove();
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('input', e => {
  if (!scrubberEnabled) return;
  if (!isTextInput(e.target)) return;
  const el = e.target;
  if (!getRaw(el).trim()) { 
    cleanUp(el); 
    return; 
  }
  lastActive = el;
  injectScrubButton(el);
  autoHighlightSensitive(el);
}, true);

// Automatically highlight sensitive info in textarea on input
function autoHighlightSensitive(el) {
  if (!scrubberEnabled || !el) return;
  
  const text = getRaw(el);
  if (!text.trim()) {
    el.style.background = '';
    el.removeAttribute('data-sensitive-count');
    return;
  }

  // Use the redactor with custom rules
  const { stats } = self.PromptScrubberRedactor.redact(text, customRules);
  const totalSensitive = Object.values(stats).reduce((a,b)=>a+b,0);
  
  if (totalSensitive > 0) {
    // Apply highlighting based on the platform
    const host = window.location.hostname;
    if (host.includes('chat.openai.com')) {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #ffebee 100%)';
    } else if (host.includes('claude.ai')) {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #ffe0e0 100%)';
    } else {
      el.style.background = 'linear-gradient(90deg, #fff 0%, #fff1f1 100%)';
    }
    el.setAttribute('data-sensitive-count', totalSensitive);
  } else {
    el.style.background = '';
    el.removeAttribute('data-sensitive-count');
  }
}

/* ───────── Scrub core (enhanced) ───────── */
function scrubText(target) {
  if (!scrubberEnabled || !target) return;
  
  // Remove underlines if they exist
  if (underlineState.get(target)) {
    removeUnderlines(target);
    underlineState.set(target, false);
    updateUnderlineButton && updateUnderlineButton(target, false);
  }
  
  const raw = getRaw(target);
  
  // Single pass with both custom and built-in rules
  const { clean, stats } = self.PromptScrubberRedactor.redact(raw, customRules);
  const totalMasked = Object.values(stats).reduce((a,b)=>a+b,0);
  
  setRaw(target, clean);
  toast(totalMasked ? `${totalMasked} sensitive item${totalMasked>1?'s':''} masked` : 'No sensitive items detected');
  if(!clean.trim()) cleanUp(target);
}

/* clean-up when box is emptied */
function cleanUp(el) {
  const buttonContainer = document.querySelector('.scrub-button-container');
  if (buttonContainer) buttonContainer.remove();
  underlineState.delete(el);
  lastActive = null;
  el.style.background = '';
}

// Remove highlighting when text is empty
document.addEventListener('input', e => {
  if (!isTextInput(e.target)) return;
  const el = e.target;
  if (!getRaw(el).trim()) {
    el.style.background = '';
    el.removeAttribute('data-sensitive-count');
  }
}, true);