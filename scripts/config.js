/**
 * Configuration settings for Prompt-Scrubber
 */
const CONFIG = {
  // Default enabled state
  enabled: true,
  
  // Patterns to detect and mask
  patterns: [
    // AWS API Keys
    {
      name: 'AWS API Key',
      regex: /AKIA[0-9A-Z]{16}/g,
      replacement: '<API-KEY>'
    },
    // Generic API Keys/Tokens (32+ characters of hex)
    {
      name: 'API Token',
      regex: /\b[0-9a-fA-F]{32,}\b/g,
      replacement: '<API-TOKEN>'
    },
    // Email addresses
    {
      name: 'Email',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      replacement: '<EMAIL>'
    },
    // Credit card numbers (with or without spaces/dashes)
    {
      name: 'Credit Card',
      regex: /\b(?:\d[ -]*?){13,16}\b/g,
      replacement: '<CARD-NUMBER>'
    },
    // OpenAI API Keys
    {
      name: 'OpenAI API Key',
      regex: /sk-[a-zA-Z0-9]{32,}/g,
      replacement: '<API-KEY>'
    }
  ],
  
  // CSS class for highlighting detected patterns
  highlightClass: 'prompt-scrubber-highlight',
  
  // Target element selectors
  targetSelectors: 'textarea, [contenteditable="true"], [role="textbox"]',
  
  // Debounce delay in milliseconds for input events
  debounceDelay: 100
};