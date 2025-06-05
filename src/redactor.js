/****************  src/redactor.js  ****************/
/*─────────────────────────────────────────────────
  Prompt-Scrubber – redactor.js  (ES module)
  Pure functions for masking sensitive tokens.
──────────────────────────────────────────────────*/

import { rules } from './gen/redactorRules.js';

/* redact() – apply every rule once, including custom rules. */
export function redact(src, customRules = []) {
  let out = src, stats = Object.create(null);
  
  // First apply custom rules (case-insensitive string matches)
  if (Array.isArray(customRules)) {
    for (const rule of customRules) {
      if (!rule?.value || !rule?.label) continue;
      
      try {
        const before = out;
        // Escape special regex characters in the value
        const escapedValue = rule.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Create case-insensitive word boundary pattern
        const pattern = new RegExp(`\\b${escapedValue}\\b`, 'gi');
        out = out.replace(pattern, `<${rule.label}>`);
        if (before !== out) {
          stats[`custom_${rule.label}`] = (stats[`custom_${rule.label}`] || 0) + 1;
        }
      } catch (error) {
        console.error('[Scrubber] Error applying custom rule:', error);
        continue;
      }
    }
  }
  
  // Then apply built-in rules
  for (const r of rules) {
    try {
      const before = out;
      out = out.replace(r.pattern, r.replacer);
      if (before !== out) stats[r.id] = (stats[r.id] || 0) + 1;
    } catch (error) {
      console.error('[Scrubber] Error applying rule:', r.id, error);
      continue;
    }
  }
  
  return { clean: out, stats };
}

/* Expose to window so contentScript can call it after bundling */
if (typeof window !== 'undefined') {
  window.PromptScrubberRedactor = { redact, rules };
}