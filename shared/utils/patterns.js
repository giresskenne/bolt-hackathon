/**
 * Shared pattern definitions for both extension and webapp
 * This ensures consistency across both applications
 */

export const PATTERN_CATEGORIES = {
  CLOUD_SECRETS: 'Cloud & API Secrets',
  PERSONAL_DATA: 'Personal Identifiers', 
  NETWORK_INFO: 'Network & Infrastructure',
  SYSTEM_IDS: 'System Identifiers'
};

export const PLAN_LIMITS = {
  free: {
    scrubsPerMonth: 800,
    customRules: 25,
    patterns: 20,
    history: '24h',
    sites: ['chatgpt', 'claude', 'gemini', 'copilot']
  },
  pro: {
    scrubsPerMonth: -1, // unlimited
    customRules: 100,
    patterns: 100,
    history: '90d',
    sites: 'allowlist'
  },
  enterprise: {
    scrubsPerMonth: -1,
    customRules: -1,
    patterns: -1,
    history: 'custom',
    sites: 'policy'
  }
};

export const SUPPORTED_SITES = {
  free: [
    { name: 'ChatGPT', url: 'chat.openai.com' },
    { name: 'Claude', url: 'claude.ai' },
    { name: 'Google Gemini', url: 'gemini.google.com' },
    { name: 'GitHub Copilot', url: 'github.com/copilot' }
  ],
  pro: 'Any website via allow-list',
  enterprise: 'Organization-wide policy control'
};