/**
 * Popup script for Prompt-Scrubber
 */

// Add error handling for the entire script
try {
  console.log('[Popup] Script loading started...');
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Popup] DOM Content Loaded event fired');
    
    try {
      initializePopup();
    } catch (error) {
      console.error('[Popup] Error during initialization:', error);
      // Show error to user
      document.body.innerHTML = `
        <div style="padding: 20px; color: red; font-family: sans-serif;">
          <h3>Extension Error</h3>
          <p>Failed to initialize popup: ${error.message}</p>
          <p>Please try reloading the extension.</p>
        </div>
      `;
    }
  });

  function initializePopup() {
    console.log('[Popup] Starting popup initialization...');
    
    // Elements - with error checking
    const toggleElement = document.getElementById('protectionToggle');
    const settingsBtn = document.getElementById('settingsBtn');
    const backBtn = document.getElementById('backBtn');
    const mainView = document.getElementById('mainView');
    const settingsView = document.getElementById('settingsView');
    const rulesList = document.getElementById('rulesList');
    const addRuleForm = document.getElementById('addRuleForm');
    const customRuleCount = document.getElementById('customRuleCount');
    const builtInPatternCount = document.getElementById('builtInPatternCount');
    const syncStatus = document.getElementById('syncStatus');
    const onboardingBanner = document.getElementById('onboardingBanner');
    const onboardingAddBtn = document.getElementById('onboardingAddBtn');
    const onboardingDismissBtn = document.getElementById('onboardingDismissBtn');
    const valueError = document.getElementById('valueError');
    const labelError = document.getElementById('labelError');
    const ruleValueInput = document.getElementById('ruleValue');
    const ruleLabelInput = document.getElementById('ruleLabel');
    const maskedCount = document.getElementById('maskedCount');
    
    // Check if critical elements exist
    const criticalElements = {
      toggleElement,
      settingsBtn,
      backBtn,
      mainView,
      settingsView,
      customRuleCount,
      maskedCount
    };
    
    const missingElements = Object.entries(criticalElements)
      .filter(([name, element]) => !element)
      .map(([name]) => name);
    
    if (missingElements.length > 0) {
      throw new Error(`Missing critical elements: ${missingElements.join(', ')}`);
    }
    
    console.log('[Popup] All critical elements found');
    console.log('[Popup] Toggle element:', toggleElement);
    console.log('[Popup] Toggle element ID:', toggleElement.id);
    
    // State
    let customRules = [];
    let activeDropdown = null;
    let isInitialized = false;
    
    // Initialize all components
    loadCustomRules();
    initializeProtectionToggle();
    loadMaskedCount();
    loadBuiltInPatternCount();
    
    // Event Listeners
    settingsBtn.addEventListener('click', showSettings);
    backBtn.addEventListener('click', showMain);
    addRuleForm.addEventListener('submit', handleAddRule);
    onboardingAddBtn?.addEventListener('click', handleOnboardingAdd);
    onboardingDismissBtn?.addEventListener('click', handleOnboardingDismiss);
    document.addEventListener('click', handleGlobalClick);
    
    // Clear errors on input
    ruleValueInput?.addEventListener('input', () => clearError('value'));
    ruleLabelInput?.addEventListener('input', () => clearError('label'));
    
    function showSettings() {
      mainView.classList.add('hidden');
      settingsView.classList.remove('hidden');
      checkOnboardingBanner();
    }
    
    function showMain() {
      settingsView.classList.add('hidden');
      mainView.classList.remove('hidden');
    }
    
    function checkOnboardingBanner() {
      if (!onboardingBanner) return;
      
      // Show banner only if no custom rules exist and not previously dismissed
      const dismissed = localStorage.getItem('onboardingDismissed') === 'true';
      if (customRules.length === 0 && !dismissed) {
        showOnboardingBanner();
      } else {
        hideOnboardingBanner();
      }
    }
    
    function showOnboardingBanner() {
      if (!onboardingBanner) return;
      onboardingBanner.classList.remove('hidden');
      // Trigger fade-in animation
      requestAnimationFrame(() => {
        onboardingBanner.classList.add('show');
      });
    }
    
    function hideOnboardingBanner() {
      if (!onboardingBanner) return;
      onboardingBanner.classList.remove('show');
      setTimeout(() => {
        onboardingBanner.classList.add('hidden');
      }, 150);
    }
    
    function handleOnboardingAdd() {
      hideOnboardingBanner();
      // Focus the first input field
      ruleValueInput?.focus();
    }
    
    function handleOnboardingDismiss() {
      hideOnboardingBanner();
      localStorage.setItem('onboardingDismissed', 'true');
    }
    
    async function initializeProtectionToggle() {
      console.log('[Popup] Initializing protection toggle...');
      
      if (!toggleElement) {
        console.error('[Popup] Toggle element not found! Looking for ID: protectionToggle');
        console.log('[Popup] Available elements with IDs:', 
          Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
      }
      
      try {
        // Check if chrome.storage is available
        if (!chrome?.storage) {
          throw new Error('Chrome storage API not available');
        }
        
        // Load current state from storage (try sync first)
        let enabled = true; // default value
        
        try {
          const syncResult = await chrome.storage.sync.get('enabled');
          enabled = syncResult.hasOwnProperty('enabled') ? syncResult.enabled : true;
          console.log('[Popup] Loaded enabled state from sync:', enabled);
        } catch (syncError) {
          console.log('[Popup] Sync storage not available, trying local storage');
          try {
            const localResult = await chrome.storage.local.get('enabled');
            enabled = localResult.hasOwnProperty('enabled') ? localResult.enabled : true;
            console.log('[Popup] Loaded enabled state from local:', enabled);
          } catch (localError) {
            console.error('[Popup] Both sync and local storage failed:', localError);
            enabled = true; // fallback to default
          }
        }
        
        // Set the toggle state
        toggleElement.checked = enabled;
        console.log('[Popup] Set toggle checked to:', enabled);
        
        // Add change event listener (remove any existing ones first)
        toggleElement.removeEventListener('change', handleToggleChange);
        toggleElement.addEventListener('change', handleToggleChange);
        console.log('[Popup] Added toggle change listener');
        
        isInitialized = true;
        console.log('[Popup] Toggle initialization complete');
        
      } catch (error) {
        console.error('[Popup] Error initializing toggle:', error);
        // Show error in UI
        if (syncStatus) {
          syncStatus.textContent = 'Error: Could not initialize toggle';
          syncStatus.style.color = 'red';
        }
      }
    }
    
    async function handleToggleChange(event) {
      console.log('[Popup] Toggle change event triggered');
      console.log('[Popup] Event target:', event.target);
      console.log('[Popup] Is initialized:', isInitialized);
      
      if (!isInitialized) {
        console.log('[Popup] Toggle not initialized yet, ignoring change');
        return;
      }
      
      const enabled = toggleElement.checked;
      console.log('[Popup] Toggle changed to:', enabled);
      
      try {
        // Check if chrome APIs are available
        if (!chrome?.storage || !chrome?.tabs) {
          throw new Error('Chrome APIs not available');
        }
        
        // Save to storage (try sync first, fallback to local)
        try {
          await chrome.storage.sync.set({ enabled });
          console.log('[Popup] Saved enabled state to sync storage:', enabled);
        } catch (syncError) {
          console.log('[Popup] Sync storage failed, using local storage');
          await chrome.storage.local.set({ enabled });
          console.log('[Popup] Saved enabled state to local storage:', enabled);
        }
        
        // Notify all content scripts
        const tabs = await chrome.tabs.query({});
        console.log('[Popup] Notifying', tabs.length, 'tabs of state change');
        
        let notifiedCount = 0;
        for (const tab of tabs) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { 
              action: 'setState', 
              enabled 
            });
            console.log('[Popup] Tab', tab.id, 'responded:', response);
            notifiedCount++;
          } catch (error) {
            // This is expected for tabs where content script isn't loaded
            console.debug('[Popup] Could not notify tab', tab.id, ':', error.message);
          }
        }
        
        console.log('[Popup] Successfully notified', notifiedCount, 'tabs');
        
        // Update status
        if (syncStatus) {
          syncStatus.textContent = enabled ? 'Protection enabled' : 'Protection disabled';
          syncStatus.style.color = enabled ? 'green' : 'orange';
        }
        
      } catch (error) {
        console.error('[Popup] Error handling toggle change:', error);
        // Revert toggle state on error
        toggleElement.checked = !enabled;
        if (syncStatus) {
          syncStatus.textContent = 'Error: Could not save settings';
          syncStatus.style.color = 'red';
        }
      }
    }
    
    async function loadBuiltInPatternCount() {
      try {
        // Check if chrome.runtime is available
        if (!chrome?.runtime?.getURL) {
          throw new Error('Chrome runtime API not available');
        }
        
        // Load the patterns.json file to count built-in patterns
        const response = await fetch(chrome.runtime.getURL('src/patterns.json'));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const count = data.identifiers ? data.identifiers.length : 0;
        
        if (builtInPatternCount) {
          builtInPatternCount.textContent = count;
        }
        console.log('[Popup] Loaded built-in pattern count:', count);
      } catch (error) {
        console.error('Error loading built-in pattern count:', error);
        // Fallback to a reasonable default
        if (builtInPatternCount) {
          builtInPatternCount.textContent = '30+';
        }
      }
    }
    
    async function loadCustomRules() {
      try {
        if (!chrome?.storage) {
          throw new Error('Chrome storage API not available');
        }
        
        const result = await chrome.storage.sync.get('customRules');
        customRules = result.customRules || [];
        updateRulesList();
        updateRuleCount();
        checkStorageQuota();
      } catch (error) {
        console.error('Error loading custom rules:', error);
        showToast('Mappings stored locally – sync unavailable');
        // Fallback to local storage
        try {
          const result = await chrome.storage.local.get('customRules');
          customRules = result.customRules || [];
          updateRulesList();
          updateRuleCount();
        } catch (localError) {
          console.error('Error loading from local storage:', localError);
          customRules = [];
          updateRulesList();
          updateRuleCount();
        }
      }
    }
    
    async function saveCustomRules() {
      try {
        if (!chrome?.storage) {
          throw new Error('Chrome storage API not available');
        }
        
        await chrome.storage.sync.set({ customRules });
        checkStorageQuota();
      } catch (error) {
        console.error('Error saving to sync storage:', error);
        showToast('Mappings stored locally – sync unavailable');
        // Fallback to local storage
        try {
          await chrome.storage.local.set({ customRules });
        } catch (localError) {
          console.error('Error saving to local storage:', localError);
          showToast('Error saving mappings');
          return;
        }
      }
      
      // Notify content scripts
      if (chrome?.tabs) {
        try {
          const tabs = await chrome.tabs.query({});
          for (const tab of tabs) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: 'updateCustomRules',
                rules: customRules
              });
            } catch (error) {
              // Ignore errors for tabs where content script isn't loaded
            }
          }
        } catch (error) {
          console.error('Error notifying tabs:', error);
        }
      }
    }
    
    async function checkStorageQuota() {
      try {
        if (!chrome?.storage?.sync?.getBytesInUse) {
          return; // API not available
        }
        
        const bytesInUse = await chrome.storage.sync.getBytesInUse();
        const QUOTA = chrome.storage.sync.QUOTA_BYTES;
        if (bytesInUse > QUOTA * 0.9) {
          showToast('Sync quota exceeded – storing mappings only on this device');
        } else if (syncStatus) {
          syncStatus.textContent = 'Mappings synced';
          syncStatus.style.color = '';
        }
      } catch (error) {
        console.error('Error checking storage quota:', error);
      }
    }
    
    async function loadMaskedCount() {
      try {
        if (!chrome?.storage?.local) {
          throw new Error('Chrome local storage not available');
        }
        
        const result = await chrome.storage.local.get('maskedCount');
        const count = result.maskedCount || 0;
        
        if (maskedCount) {
          maskedCount.textContent = count.toLocaleString();
        }
        console.log('[Popup] Loaded masked count:', count);
      } catch (error) {
        console.error('Error loading masked count:', error);
        if (maskedCount) {
          maskedCount.textContent = '0';
        }
      }
    }
    
    async function incrementMaskedCount(amount = 1) {
      try {
        if (!chrome?.storage?.local) {
          throw new Error('Chrome local storage not available');
        }
        
        const result = await chrome.storage.local.get('maskedCount');
        const currentCount = result.maskedCount || 0;
        const newCount = currentCount + amount;
        await chrome.storage.local.set({ maskedCount: newCount });
        
        if (maskedCount) {
          maskedCount.textContent = newCount.toLocaleString();
        }
        console.log('[Popup] Incremented masked count from', currentCount, 'to', newCount);
      } catch (error) {
        console.error('Error incrementing masked count:', error);
      }
    }
    
    function updateRulesList() {
      if (!rulesList) return;
      
      rulesList.innerHTML = customRules.map((rule, index) => `
        <div class="rule-item">
          <div class="rule-info">
            <div class="rule-value">${escapeHtml(rule.value)}</div>
            <div class="rule-label">${escapeHtml(rule.label)}</div>
          </div>
          <div class="rule-actions">
            <div class="dropdown" data-index="${index}">
              <button class="icon-button" aria-label="Actions">⋮</button>
              <div class="dropdown-content">
                <button class="modify-rule">Modify</button>
                <button class="delete-rule" aria-label="Remove">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      
      // Add event listeners
      rulesList.querySelectorAll('.dropdown').forEach(dropdown => {
        const index = parseInt(dropdown.dataset.index);
        
        dropdown.querySelector('button').addEventListener('click', (e) => {
          e.stopPropagation();
          closeDropdowns();
          dropdown.classList.add('active');
          activeDropdown = dropdown;
        });
        
        dropdown.querySelector('.modify-rule').addEventListener('click', () => {
          modifyRule(index);
        });
        
        dropdown.querySelector('.delete-rule').addEventListener('click', () => {
          deleteRule(index);
        });
      });
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function handleGlobalClick() {
      closeDropdowns();
    }
    
    function closeDropdowns() {
      if (activeDropdown) {
        activeDropdown.classList.remove('active');
        activeDropdown = null;
      }
    }
    
    function modifyRule(index) {
      const rule = customRules[index];
      if (ruleValueInput) ruleValueInput.value = rule.value;
      if (ruleLabelInput) ruleLabelInput.value = rule.label;
      customRules.splice(index, 1);
      saveCustomRules();
      updateRulesList();
      updateRuleCount();
      checkOnboardingBanner();
    }
    
    function deleteRule(index) {
      customRules.splice(index, 1);
      saveCustomRules();
      updateRulesList();
      updateRuleCount();
      checkOnboardingBanner();
    }
    
    function updateRuleCount() {
      if (customRuleCount) {
        customRuleCount.textContent = customRules.length;
      }
    }
    
    function showError(field, message) {
      const errorElement = field === 'value' ? valueError : labelError;
      const inputElement = field === 'value' ? ruleValueInput : ruleLabelInput;
      
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
      }
      if (inputElement) {
        inputElement.classList.add('error');
      }
    }
    
    function clearError(field) {
      const errorElement = field === 'value' ? valueError : labelError;
      const inputElement = field === 'value' ? ruleValueInput : ruleLabelInput;
      
      if (errorElement) {
        errorElement.classList.add('hidden');
      }
      if (inputElement) {
        inputElement.classList.remove('error');
      }
    }
    
    function clearAllErrors() {
      clearError('value');
      clearError('label');
    }
    
    function showToast(message) {
      // Simple toast implementation
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
      `;
      
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
      });
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }
    
    async function handleAddRule(e) {
      e.preventDefault();
      
      clearAllErrors();
      
      const value = ruleValueInput?.value?.trim() || '';
      const label = ruleLabelInput?.value?.trim() || '';
      
      let hasError = false;
      
      if (!value) {
        showError('value', 'Please enter a value');
        hasError = true;
      }
      
      if (!label) {
        showError('label', 'Please enter a label');
        hasError = true;
      }
      
      if (hasError) return;
      
      // Validate label format (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9_-]+$/.test(label)) {
        showError('label', 'Label can only contain letters, numbers, hyphens, and underscores');
        return;
      }
      
      // Check for duplicate label (case-insensitive)
      if (customRules.some(r => r.label.toLowerCase() === label.toLowerCase())) {
        showError('label', 'Label already in use');
        return;
      }
      
      // Check for duplicate value (case-insensitive)
      if (customRules.some(r => r.value.toLowerCase() === value.toLowerCase())) {
        showError('value', 'That value is already mapped');
        return;
      }
      
      customRules.push({ value, label });
      await saveCustomRules();
      updateRulesList();
      updateRuleCount();
      checkOnboardingBanner();
      
      // Clear form
      if (addRuleForm) addRuleForm.reset();
      clearAllErrors();
      
      showToast('Mapping added successfully');
    }
    
    // Listen for messages from content script about masked items
    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('[Popup] Received message:', message);
        if (message.action === 'incrementMaskedCount') {
          incrementMaskedCount(message.count || 1);
          sendResponse({ success: true });
          return true; // Keep the message channel open for async response
        }
      });
    }
    
    // Also listen for storage changes to update the count in real-time
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.maskedCount) {
          const newCount = changes.maskedCount.newValue || 0;
          if (maskedCount) {
            maskedCount.textContent = newCount.toLocaleString();
          }
          console.log('[Popup] Storage changed, updated count to:', newCount);
        }
        
        // Listen for enabled state changes
        if ((namespace === 'sync' || namespace === 'local') && changes.enabled) {
          const newEnabled = changes.enabled.newValue;
          console.log('[Popup] Enabled state changed in storage:', newEnabled);
          if (toggleElement && toggleElement.checked !== newEnabled) {
            toggleElement.checked = newEnabled;
          }
        }
      });
    }
    
    // Add test functions for debugging
    window.testToggle = function() {
      console.log('[Popup] Testing toggle...');
      console.log('Toggle element:', toggleElement);
      console.log('Toggle checked:', toggleElement?.checked);
      console.log('Is initialized:', isInitialized);
      
      if (toggleElement) {
        // Manually trigger a change
        toggleElement.checked = !toggleElement.checked;
        handleToggleChange({ target: toggleElement });
      }
    };
    
    window.clickToggle = function() {
      console.log('[Popup] Manually clicking toggle...');
      if (toggleElement) {
        toggleElement.click();
      }
    };
    
    console.log('[Popup] Initialization complete!');
  }

} catch (error) {
  console.error('[Popup] Critical error in popup script:', error);
  
  // Show error message to user
  document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif; text-align: center;">
        <h3>🚨 Extension Error</h3>
        <p><strong>Failed to load popup:</strong></p>
        <p style="font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${error.message}
        </p>
        <hr style="margin: 20px 0;">
        <p><strong>Troubleshooting:</strong></p>
        <ol style="text-align: left; max-width: 300px; margin: 0 auto;">
          <li>Try reloading the extension</li>
          <li>Check if you're on a supported website</li>
          <li>Restart your browser</li>
          <li>Check the browser console for more details</li>
        </ol>
      </div>
    `;
  });
}