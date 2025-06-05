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
  
  // State
  let customRules = [];
  
  // Initialize
  loadCustomRules();
  initializeProtectionToggle();
  
  // Event Listeners
  settingsBtn.addEventListener('click', showSettings);
  backBtn.addEventListener('click', showMain);
  addRuleForm.addEventListener('submit', handleAddRule);
  
  function showSettings() {
    mainView.classList.add('hidden');
    settingsView.classList.remove('hidden');
  }
  
  function showMain() {
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');
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
      syncStatus.textContent = 'Using local storage (sync unavailable)';
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
      syncStatus.textContent = 'Using local storage (sync unavailable)';
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
      if (bytesInUse > QUOTA * 0.8) {
        syncStatus.textContent = 'Warning: Storage quota nearly full';
      } else {
        syncStatus.textContent = 'All changes saved and synced';
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  }
  
  function updateRulesList() {
    rulesList.innerHTML = customRules.map((rule, index) => `
      <div class="rule-item">
        <div class="rule-info">
          <div class="rule-label">&lt;${rule.label}&gt;</div>
          <div class="rule-value">${rule.value}</div>
        </div>
        <button class="delete-rule" data-index="${index}">×</button>
      </div>
    `).join('');
    
    // Add delete handlers
    rulesList.querySelectorAll('.delete-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        customRules.splice(index, 1);
        saveCustomRules();
        updateRulesList();
        updateRuleCount();
      });
    });
  }
  
  function updateRuleCount() {
    customRuleCount.textContent = customRules.length;
  }
  
  async function handleAddRule(e) {
    e.preventDefault();
    
    const label = document.getElementById('ruleLabel').value.trim();
    const value = document.getElementById('ruleValue').value.trim();
    
    if (!label || !value) {
      alert('Both label and value are required');
      return;
    }
    
    // Check for duplicates
    if (customRules.some(r => r.label === label || r.value === value)) {
      alert('A rule with this label or value already exists');
      return;
    }
    
    customRules.push({ label, value });
    await saveCustomRules();
    updateRulesList();
    updateRuleCount();
    
    // Clear form
    addRuleForm.reset();
  }
});