/**
 * Popup script for Prompt-Scrubber
 */
document.addEventListener('DOMContentLoaded', () => {
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
  const syncStatus = document.getElementById('syncStatus');
  const onboardingBanner = document.getElementById('onboardingBanner');
  const onboardingAddBtn = document.getElementById('onboardingAddBtn');
  const onboardingDismissBtn = document.getElementById('onboardingDismissBtn');
  const valueError = document.getElementById('valueError');
  const labelError = document.getElementById('labelError');
  const ruleValueInput = document.getElementById('ruleValue');
  const ruleLabelInput = document.getElementById('ruleLabel');
  
  // State
  let customRules = [];
  let activeDropdown = null;
  
  // Initialize
  loadCustomRules();
  initializeProtectionToggle();
  
  // Event Listeners
  settingsBtn.addEventListener('click', showSettings);
  backBtn.addEventListener('click', showMain);
  addRuleForm.addEventListener('submit', handleAddRule);
  onboardingAddBtn.addEventListener('click', handleOnboardingAdd);
  onboardingDismissBtn.addEventListener('click', handleOnboardingDismiss);
  document.addEventListener('click', handleGlobalClick);
  
  // Clear errors on input
  ruleValueInput.addEventListener('input', () => clearError('value'));
  ruleLabelInput.addEventListener('input', () => clearError('label'));
  
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
    // Show banner only if no custom rules exist and not previously dismissed
    const dismissed = localStorage.getItem('onboardingDismissed') === 'true';
    if (customRules.length === 0 && !dismissed) {
      showOnboardingBanner();
    } else {
      hideOnboardingBanner();
    }
  }
  
  function showOnboardingBanner() {
    onboardingBanner.classList.remove('hidden');
    // Trigger fade-in animation
    requestAnimationFrame(() => {
      onboardingBanner.classList.add('show');
    });
  }
  
  function hideOnboardingBanner() {
    onboardingBanner.classList.remove('show');
    setTimeout(() => {
      onboardingBanner.classList.add('hidden');
    }, 150);
  }
  
  function handleOnboardingAdd() {
    hideOnboardingBanner();
    // Focus the first input field
    ruleValueInput.focus();
  }
  
  function handleOnboardingDismiss() {
    hideOnboardingBanner();
    localStorage.setItem('onboardingDismissed', 'true');
  }
  
  function initializeProtectionToggle() {
    chrome.storage.sync.get('enabled', result => {
      const enabled = result.hasOwnProperty('enabled') ? result.enabled : true;
      toggleElement.checked = enabled;
      updateToggleStatus(enabled);
    });
    
    toggleElement.addEventListener('change', () => {
      const enabled = toggleElement.checked;
      updateToggleStatus(enabled);
      chrome.storage.sync.set({ enabled });
      
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
  
  function updateToggleStatus(enabled) {
    toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
    toggleStatus.className = enabled ? '' : 'disabled';
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
      showToast('Mappings stored locally – sync unavailable');
      // Fallback to local storage
      const result = await chrome.storage.local.get('customRules');
      customRules = result.customRules || [];
      updateRulesList();
      updateRuleCount();
    }
  }
  
  async function saveCustomRules() {
    try {
      await chrome.storage.sync.set({ customRules });
      checkStorageQuota();
    } catch (error) {
      console.error('Error saving to sync storage:', error);
      showToast('Mappings stored locally – sync unavailable');
      // Fallback to local storage
      await chrome.storage.local.set({ customRules });
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
      const bytesInUse = await chrome.storage.sync.getBytesInUse();
      const QUOTA = chrome.storage.sync.QUOTA_BYTES;
      if (bytesInUse > QUOTA * 0.9) {
        showToast('Sync quota exceeded – storing mappings only on this device');
      } else {
        syncStatus.textContent = 'Mappings synced';
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  }
  
  function updateRulesList() {
    rulesList.innerHTML = customRules.map((rule, index) => `
      <div class="rule-item">
        <div class="rule-info">
          <div class="rule-value">${escapeHtml(rule.value)}</div>
          <div class="rule-label"><${escapeHtml(rule.label)}></div>
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
    ruleValueInput.value = rule.value;
    ruleLabelInput.value = rule.label;
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
    customRuleCount.textContent = customRules.length;
  }
  
  function showError(field, message) {
    const errorElement = field === 'value' ? valueError : labelError;
    const inputElement = field === 'value' ? ruleValueInput : ruleLabelInput;
    
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    inputElement.classList.add('error');
  }
  
  function clearError(field) {
    const errorElement = field === 'value' ? valueError : labelError;
    const inputElement = field === 'value' ? ruleValueInput : ruleLabelInput;
    
    errorElement.classList.add('hidden');
    inputElement.classList.remove('error');
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
    
    const value = ruleValueInput.value.trim();
    const label = ruleLabelInput.value.trim();
    
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
    addRuleForm.reset();
    clearAllErrors();
    
    showToast('Mappings synced');
  }
});