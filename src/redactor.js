/****************  src/redactor.js  ****************/
/*─────────────────────────────────────────────────
  Prompt-Scrubber – redactor.js  (ES module)
  Pure functions for masking sensitive tokens.
──────────────────────────────────────────────────*/

import { rules } from './gen/redactorRules.js';

/* redact() – apply every rule once, including custom rules. */
export function redact(src, customRules = []) {
  let out = src, stats = Object.create(null);
  
  // Apply built-in rules
  for (const r of rules) {
    const before = out;
    out = out.replace(r.pattern, r.replacer);
    if (before !== out) stats[r.id] = (stats[r.id] || 0) + 1;
  }
  
  // Apply custom rules (exact string matches only)
  for (const rule of customRules) {
    const before = out;
    // Escape special regex characters in the value
    const escapedValue = rule.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedValue, 'g');
    out = out.replace(pattern, `<${rule.label}>`);
    if (before !== out) stats[`custom_${rule.label}`] = (stats[`custom_${rule.label}`] || 0) + 1;
  }
  
  return { clean: out, stats };
}

/* Expose to window so contentScript can call it after bundling */
if (typeof window !== 'undefined') {
  window.PromptScrubberRedactor = { redact };
}