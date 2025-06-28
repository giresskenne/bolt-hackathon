/****************  src/redactor.js  ****************/
/*─────────────────────────────────────────────────
  Privly-Scrubber – redactor.js  (ES module)
  Pure functions for masking sensitive tokens.
──────────────────────────────────────────────────*/

import { rules } from './gen/redactorRules.js';

/* redact() – apply every rule once, including custom rules. */
export function redact(src, customRules = []) {
  let out = src, stats = Object.create(null);
  
  // First apply custom rules with improved matching
  if (Array.isArray(customRules)) {
    // Sort custom rules by length (longest first) to handle overlapping matches
    const sortedRules = [...customRules].sort((a, b) => (b.value?.length || 0) - (a.value?.length || 0));
    
    for (const rule of sortedRules) {
      if (!rule?.value || !rule?.label) continue;
      
      try {
        const before = out;
        
        // Escape special regex characters in the value
        const escapedValue = rule.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create a more flexible pattern that works in different contexts
        // This pattern looks for the exact string but doesn't require word boundaries
        // which allows it to work inside JSON, URLs, etc.
        const pattern = new RegExp(escapedValue, 'gi');
        
        // Apply replacement
        out = out.replace(pattern, `<${rule.label}>`);
        
        // Count replacements
        if (before !== out) {
          const matches = before.match(pattern);
          stats[`custom_${rule.label}`] = matches ? matches.length : 1;
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
      if (before !== out) {
        const matches = before.match(r.pattern);
        stats[r.id] = matches ? matches.length : 1;
      }
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