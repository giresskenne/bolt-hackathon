/****************  src/redactor.js  ****************/
/*─────────────────────────────────────────────────
  Prompt-Scrubber – redactor.js  (ES module)
  Pure functions for masking sensitive tokens.
──────────────────────────────────────────────────*/

import { rules } from './gen/redactorRules.js';

/* redact() – apply every rule once, including custom rules. */
export function redact(src, customRules = []) {
  let out = src, stats = Object.create(null);
  
  // First apply custom rules (exact string matches only)
  for (const rule of customRules) {
    if (!rule.value || !rule.label) continue;
    const before = out;
    // Escape special regex characters in the value
    const escapedValue = rule.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Create word boundary pattern to match whole words only
    const pattern = new RegExp(`\\b${escapedValue}\\b`, 'g');
    out = out.replace(pattern, `<${rule.label}>`);
    if (before !== out) stats[`custom_${rule.label}`] = (stats[`custom_${rule.label}`] || 0) + 1;
  }
  
  // Then apply built-in rules
  for (const r of rules) {
    const before = out;
    out = out.replace(r.pattern, r.replacer);
    if (before !== out) stats[r.id] = (stats[r.id] || 0) + 1;
  }
  
  return { clean: out, stats };
}

/* Expose to window so contentScript can call it after bundling */
if (typeof window !== 'undefined') {
  window.PromptScrubberRedactor = { redact, rules };
}