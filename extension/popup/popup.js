/**
 * Popup script for Prompt-Scrubber
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] DOM Content Loaded - Starting initialization...');
  
  // Elements
  const toggleElement = document.getElementById('toggle');
  const toggleStatus = document.getElementById('toggle-status');
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
  
  console.log('[Popup] Toggle element found:', !!toggleElement);
  console.log('[Popup] Toggle status element found:', !!toggleStatus);
  
  // State
  let customRules = [];
  let activeDropdown = null;
  
  // Initialize all components
  loadCustomRules();
  initializeProtectionToggle();
  loadMaskedCount();
  loadBuiltInPatternCount();
  
  // Event Listeners
  settingsBtn?.addEventListener('click', showSettings);
  backBtn?.addEventListener('click', showMain);
  addRuleForm?.addEventListener('submit', handleAddRule);
  onboardingAddBtn?.addEventListener('click', handleOnboardingAdd);
  onboardingDismissBtn?.addEventListener('click', handleOnboardingDismiss);
  document.addEventListener('click', handleGlobalClick);
  
  // Clear errors on input
  ruleValueInput?.addEventListener('input', () => clearError('value'));
  ruleLabelInput?.addEventListener('input', () => clearError('label'));
  
  function showSettings() {
    mainView?.classList.add('hidden');
    settingsView?.classList.remove('hidden');
    checkOnboardingBanner();
  }
  
  function showMain() {
    settingsView?.classList.add('hidden');
    mainView?.classList.remove('hidden');
  }
  
  function initializeProtectionToggle() {
    console.log('[Popup] Initializing protection toggle...');
    
    if (!toggleElement) {
      console.error('[Popup] Toggle element not found!');
      return;
    }
    
    // Load current state from storage
    chrome.storage.sync.get('enabled', result => {
      const enabled = result.hasOwnProperty('enabled') ? result.enabled : true;
      console.log('[Popup] Loaded enabled state:', enabled);
      toggleElement.checked = enabled;
      updateToggleStatus(enabled);
    });
    
    // Add change event listener
    toggleElement.addEventListener('change', () => {
      const enabled = toggleElement.checked;
      console.log('[Popup] Toggle changed to:', enabled);
      updateToggleStatus(enabled);
      chrome.storage.sync.set({ enabled });
      
      // Notify all content scripts
      chrome.tabs.query({}, tabs => {
        console.log('[Popup] Notifying', tabs.length, 'tabs of state change');
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
    
    console.log('[Popup] Toggle initialization complete');
  }
  
  function updateToggleStatus(enabled) {
    if (toggleStatus) {
      toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
      toggleStatus.className = enabled ? '' : 'disabled';
    }
  }
  
  async function loadBuiltInPatternCount() {
    try {
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
      if (builtInPatternCount) {
        builtInPatternCount.textContent = '30+';
      }
    }
  }
  
  async function loadCustomRules() {
    try {
      const result = await chrome.storage.sync.get('customRules');
      customRules = result.customRules || [];
      updateRulesList();
      updateRuleCount();
      checkStorageQuota();
    } catch (error) {
      console.error('Error loading custom rules:', error);
      if (syncStatus) {
        syncStatus.textContent = 'Using local storage (sync unavailable)';
      }
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
      await chrome.storage.sync.set({ customRules });
      checkStorageQuota();
    } catch (error) {
      console.error('Error saving to sync storage:', error);
      if (syncStatus) {
        syncStatus.textContent = 'Using local storage (sync unavailable)';
      }
      // Fallback to local storage
      try {
        await chrome.storage.local.set({ customRules });
      } catch (localError) {
        console.error('Error saving to local storage:', localError);
        return;
      }
    }
    
    // Notify content scripts
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateCustomRules',
          rules: customRules
        }).catch(() => {
          // Ignore errors for tabs where content script isn't loaded
        });
      });
    });
  }
  
  async function checkStorageQuota() {
    try {
      if (!chrome?.storage?.sync?.getBytesInUse) {
        return;
      }
      
      const bytesInUse = await chrome.storage.sync.getBytesInUse();
      const QUOTA = chrome.storage.sync.QUOTA_BYTES;
      if (bytesInUse > QUOTA * 0.8) {
        if (syncStatus) {
          syncStatus.textContent = 'Warning: Storage quota nearly full';
        }
      } else {
        if (syncStatus) {
          syncStatus.textContent = 'All changes saved and synced';
        }
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  }
  
  async function loadMaskedCount() {
    try {
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
  
  function checkOnboardingBanner() {
    if (!onboardingBanner) return;
    
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
    ruleValueInput?.focus();
  }
  
  function handleOnboardingDismiss() {
    hideOnboardingBanner();
    localStorage.setItem('onboardingDismissed', 'true');
  }
  
  function updateRulesList() {
    if (!rulesList) return;
    
    rulesList.innerHTML = customRules.map((rule, index) => `
      <div class="rule-item">
        <div class="rule-info">
          <div class="rule-value">${escapeHtml(rule.value)}</div>
          <div class="rule-label">&lt;${escapeHtml(rule.label)}&gt;</div>
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
    
    // Validate label format
    if (!/^[a-zA-Z0-9_-]+$/.test(label)) {
      showError('label', 'Label can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    // Check for duplicates
    if (customRules.some(r => 
      r.label.toLowerCase() === label.toLowerCase() || 
      r.value.toLowerCase() === value.toLowerCase()
    )) {
      showError('label', 'A rule with this label or value already exists');
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
  }
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Popup] Received message:', message);
    if (message.action === 'incrementMaskedCount') {
      loadMaskedCount(); // Reload the count from storage
      sendResponse({ success: true });
      return true;
    }
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.maskedCount) {
      const newCount = changes.maskedCount.newValue || 0;
      if (maskedCount) {
        maskedCount.textContent = newCount.toLocaleString();
      }
    }
    
    if ((namespace === 'sync' || namespace === 'local') && changes.enabled) {
      const newEnabled = changes.enabled.newValue;
      if (toggleElement && toggleElement.checked !== newEnabled) {
        toggleElement.checked = newEnabled;
        updateToggleStatus(newEnabled);
      }
    }
  });
  
  console.log('[Popup] Initialization complete!');
});