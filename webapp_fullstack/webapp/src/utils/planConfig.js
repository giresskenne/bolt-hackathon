// filepath: webapp/src/utils/planConfig.js
// Centralized plan limits configuration for webapp
export const PLAN_LIMITS = {
  free: {
    scrubsPerMonth: 500,
    customRules: 10,
    patterns: 30,
    history: '24h',
    sites: ['chatgpt', 'claude', 'gemini', 'copilot']
  },
  pro: {
    scrubsPerMonth: -1,
    customRules: 100,
    patterns: 30,
    history: '90d',
    sites: 'allowlist'
  },
  enterprise: {
    scrubsPerMonth: -1,
    customRules: -1,
    patterns: "", // unlimited
    history: 'custom',
    sites: 'policy'
  }
};
