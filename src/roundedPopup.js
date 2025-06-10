/*─────────────────────────────────────────────────────────────
  Prompt-Scrubber – roundedPopup.js
  • Creates a beautiful rounded popup overlay when extension icon is clicked
  • Replaces the default popup with a custom styled one
─────────────────────────────────────────────────────────────*/

(function() {
  'use strict';
  
  // Check if popup is already open
  if (document.getElementById('prompt-scrubber-popup')) {
    document.getElementById('prompt-scrubber-popup').remove();
    return;
  }
  
  // Create the popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'prompt-scrubber-popup';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 60px 20px 20px 20px;
    backdrop-filter: blur(4px);
  `;
  
  // Create the popup container with rounded corners
  const popup = document.createElement('div');
  popup.style.cssText = `
    width: 350px;
    height: 600px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    position: relative;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Create the popup content (same as original popup.html but inline)
  popup.innerHTML = `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: #1F2937;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <!-- Header -->
      <header style="
        padding: 16px;
        border-bottom: 1px solid #F3F4F6;
        background: white;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${chrome.runtime.getURL('icons/logo.png')}" alt="Security shield icon" width="24" height="24">
          <h1 style="font-size: 18px; font-weight: 600; color: #1F2937; flex-grow: 1; margin: 0;">Prompt-Scrubber</h1>
          <div style="
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Free</div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main style="flex: 1; overflow-y: auto; padding: 0;">
        <!-- Quick Settings Section -->
        <section style="padding: 16px; border-bottom: 1px solid #F3F4F6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #1F2937; margin: 0;">Quick Settings</h2>
            <span id="settingsBtn" style="
              display: flex;
              align-items: center;
              gap: 6px;
              color: #3B82F6;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 6px;
              transition: all 0.2s;
            " onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
              All Settings
              <img src="${chrome.runtime.getURL('icons/settings.png')}" alt="Arrow" width="14" height="14">
            </span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <label for="toggle" style="
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              cursor: pointer;
            ">
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; color: #1F2937; line-height: 1.4; margin-bottom: 4px;">
                  Automatically hide confidential information as you type
                </div>
                <div style="font-size: 13px; color: #6B7280; line-height: 1.4;">
                  while offering you the freedom to set your own custom rules
                </div>
              </div>
              <div style="
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
                flex-shrink: 0;
              ">
                <input type="checkbox" id="toggle" checked style="opacity: 0; width: 0; height: 0;">
                <span style="
                  position: absolute;
                  cursor: pointer;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-color: #3B82F6;
                  transition: 0.3s;
                  border-radius: 20px;
                ">
                  <span style="
                    position: absolute;
                    content: '';
                    height: 16px;
                    width: 16px;
                    left: 18px;
                    bottom: 2px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                  "></span>
                </span>
              </div>
            </label>
            
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 16px;
              background: #F8F9FA;
              border-radius: 8px;
              border: 1px solid #F3F4F6;
            ">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10B981;
                animation: pulse 2s infinite;
              "></div>
              <span id="toggle-status" style="font-size: 14px; color: #1F2937; font-weight: 500;">Enabled</span>
            </div>
          </div>
        </section>

        <!-- Protection Summary -->
        <section style="padding: 16px; border-bottom: 1px solid #F3F4F6;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 16px;">Protection Summary</h3>
          <div style="
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
            padding: 16px;
            background: #F8F9FA;
            border-radius: 8px;
            border: 1px solid #F3F4F6;
          ">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 24px; font-weight: 700; color: #3B82F6; line-height: 1; margin-bottom: 4px;" id="builtInPatternCount">30</div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 500; line-height: 1.3;">Built-in patterns</div>
            </div>
            <div style="width: 1px; height: 32px; background: #E5E7EB;"></div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 24px; font-weight: 700; color: #3B82F6; line-height: 1; margin-bottom: 4px;" id="customRuleCount">0</div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 500; line-height: 1.3;">Custom mappings</div>
            </div>
          </div>
          
          <div style="
            margin-top: 16px;
            padding: 16px;
            background: #F8F9FA;
            border-radius: 8px;
            border: 1px solid #F3F4F6;
          ">
            <h4 style="font-size: 13px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">Protected Information:</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                API Keys & Tokens
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                Email Addresses
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                Credit Card Numbers
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                Phone Numbers
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                Social Security Numbers
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                IP Addresses
              </li>
              <li style="font-size: 13px; color: #6B7280; line-height: 1.6; position: relative; padding-left: 16px;">
                <span style="content: '•'; color: #3B82F6; font-weight: bold; position: absolute; left: 0;">•</span>
                Custom Mappings
              </li>
            </ul>
          </div>
        </section>

        <!-- Shortcuts Section -->
        <section style="padding: 16px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 16px;">Shortcuts</h3>
          <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin-bottom: 16px;">
            Use keyboard shortcut to activate the Scrub button if it does not appear.
          </p>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
            <div style="font-size: 14px; font-weight: 500; color: #1F2937;">Scrub Current Text</div>
            <div style="display: flex; gap: 4px;">
              <kbd style="
                background: #F8F9FA;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: 500;
                color: #1F2937;
                font-family: inherit;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              ">Alt</kbd>
              <kbd style="
                background: #F8F9FA;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: 500;
                color: #1F2937;
                font-family: inherit;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              ">Shift</kbd>
              <kbd style="
                background: #F8F9FA;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: 500;
                color: #1F2937;
                font-family: inherit;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              ">S</kbd>
            </div>
          </div>
        </section>
      </main>
      
      <!-- Footer -->
      <footer style="
        border-top: 1px solid #F3F4F6;
        background: white;
        padding: 12px 16px;
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 16px;
      ">
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 8px;">
          <div style="text-align: center;">
            <span style="font-size: 12px; color: #6B7280; line-height: 1.4;">
              <span id="maskedCount">0</span> sensitive items masked since installation.
            </span>
          </div>
        </div>
        <div style="text-align: center;">
          <span style="font-size: 12px; color: #6B7280;">Version 0.2</span>
        </div>
      </footer>
    </div>
  `;
  
  // Add the popup to overlay
  overlay.appendChild(popup);
  
  // Add close functionality
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      style.remove();
    }
  });
  
  // Add escape key functionality
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      style.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Load and display actual data
  loadPopupData();
  
  function loadPopupData() {
    // Load built-in pattern count
    fetch(chrome.runtime.getURL('src/patterns.json'))
      .then(r => r.json())
      .then(data => {
        const count = data.identifiers ? data.identifiers.length : 30;
        const element = document.getElementById('builtInPatternCount');
        if (element) element.textContent = count;
      })
      .catch(() => {
        const element = document.getElementById('builtInPatternCount');
        if (element) element.textContent = '30+';
      });
    
    // Load custom rules count
    chrome.storage.sync.get('customRules', result => {
      const rules = result.customRules || [];
      const element = document.getElementById('customRuleCount');
      if (element) element.textContent = rules.length;
    });
    
    // Load masked count
    chrome.storage.local.get('maskedCount', result => {
      const count = result.maskedCount || 0;
      const element = document.getElementById('maskedCount');
      if (element) element.textContent = count.toLocaleString();
    });
    
    // Load toggle state
    chrome.storage.sync.get('enabled', result => {
      const enabled = result.hasOwnProperty('enabled') ? result.enabled : true;
      const toggle = document.getElementById('toggle');
      const status = document.getElementById('toggle-status');
      if (toggle) toggle.checked = enabled;
      if (status) {
        status.textContent = enabled ? 'Enabled' : 'Disabled';
        status.style.color = enabled ? '#1F2937' : '#EF4444';
      }
    });
  }
  
  // Add toggle functionality
  const toggle = document.getElementById('toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      const status = document.getElementById('toggle-status');
      
      // Update UI
      if (status) {
        status.textContent = enabled ? 'Enabled' : 'Disabled';
        status.style.color = enabled ? '#1F2937' : '#EF4444';
      }
      
      // Save to storage
      chrome.storage.sync.set({ enabled });
      
      // Notify content scripts
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'setState', 
            enabled 
          }).catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          });
        });
      });
    });
  }
  
})();