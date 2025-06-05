/**
 * Responsible for detecting and masking sensitive patterns in text
 */
class PatternDetector {
  constructor(config) {
    this.config = config;
    this.patterns = config.patterns;
    this.enabled = config.enabled;
  }

  setEnabled(state) {
    this.enabled = state;
  }

  detectPatterns(text) {
    if (!this.enabled || !text) {
      return [];
    }

    const matches = [];
    
    this.patterns.forEach(pattern => {
      const regex = pattern.regex;
      let match;
      
      regex.lastIndex = 0;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          pattern: pattern,
          index: match.index,
          length: match[0].length,
          value: match[0],
          replacement: pattern.replacement
        });
      }
    });
    
    return matches.sort((a, b) => a.index - b.index);
  }

  maskText(text) {
    if (!this.enabled || !text) {
      return text;
    }
    
    const matches = this.detectPatterns(text);
    
    if (matches.length === 0) {
      return text;
    }
    
    let maskedText = text;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      maskedText = 
        maskedText.substring(0, match.index) + 
        match.replacement + 
        maskedText.substring(match.index + match.length);
    }
    
    return maskedText;
  }
}