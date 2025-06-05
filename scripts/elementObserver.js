/**
 * Observes and attaches event listeners to text input elements
 */
class ElementObserver {
  constructor(config, patternDetector) {
    this.config = config;
    this.patternDetector = patternDetector;
    this.processedElements = new WeakSet();
    this.debounceTimers = new WeakMap();
    this.scrubButtons = new WeakMap();
  }

  init() {
    this.processExistingElements();
    this.observeDynamicElements();
  }

  processExistingElements() {
    const elements = document.querySelectorAll(this.config.targetSelectors);
    elements.forEach(element => this.attachListeners(element));
  }

  observeDynamicElements() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.matches && 
              node.matches(this.config.targetSelectors)) {
            this.attachListeners(node);
          }
          
          if (node.nodeType === Node.ELEMENT_NODE && node.querySelectorAll) {
            const elements = node.querySelectorAll(this.config.targetSelectors);
            elements.forEach(element => this.attachListeners(element));
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  createScrubButton(element) {
    const button = document.createElement('button');
    button.className = 'prompt-scrubber-button';
    button.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Scrub"> Scrub`;
    
    const updateButtonPosition = () => {
      const rect = element.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(element).lineHeight);
      const scrollHeight = element.scrollHeight;
      
      button.style.top = `${rect.top + window.scrollY + scrollHeight - lineHeight}px`;
      button.style.left = `${rect.left + window.scrollX + 10}px`;
    };

    button.onclick = () => {
      if (!this.patternDetector.enabled) return;
      
      const selectionStart = element.selectionStart;
      const selectionEnd = element.selectionEnd;
      
      let text = element.tagName.toLowerCase() === 'textarea' ? element.value : element.textContent;
      const maskedText = this.patternDetector.maskText(text);
      
      if (element.tagName.toLowerCase() === 'textarea') {
        element.value = maskedText;
        element.selectionStart = selectionStart;
        element.selectionEnd = selectionEnd;
      } else {
        element.textContent = maskedText;
      }
      
      this.removeHighlights(element);
      button.style.display = 'none';
    };

    document.body.appendChild(button);
    this.scrubButtons.set(element, { button, updatePosition: updateButtonPosition });
    
    element.addEventListener('scroll', updateButtonPosition);
    element.addEventListener('input', updateButtonPosition);
    window.addEventListener('resize', updateButtonPosition);
    
    return button;
  }

  attachListeners(element) {
    if (this.processedElements.has(element)) return;
    
    this.processedElements.add(element);
    const scrubButton = this.createScrubButton(element);
    
    const handleInput = () => {
      if (!this.patternDetector.enabled) {
        scrubButton.style.display = 'none';
        this.removeHighlights(element);
        return;
      }

      const text = element.tagName.toLowerCase() === 'textarea' ? element.value : element.textContent;
      
      if (!text || text.trim() === '') {
        scrubButton.style.display = 'none';
        this.removeHighlights(element);
        return;
      }

      const matches = this.patternDetector.detectPatterns(text);
      
      if (matches.length > 0) {
        this.addHighlights(element, text, matches);
        scrubButton.style.display = 'inline-flex';
        this.scrubButtons.get(element).updatePosition();
      } else {
        scrubButton.style.display = 'none';
        this.removeHighlights(element);
      }
    };
    
    element.addEventListener('input', () => {
      if (this.debounceTimers.has(element)) {
        clearTimeout(this.debounceTimers.get(element));
      }
      
      const timerId = setTimeout(handleInput, this.config.debounceDelay);
      this.debounceTimers.set(element, timerId);
    });
    
    element.addEventListener('focus', handleInput);
    element.addEventListener('paste', handleInput);
  }

  addHighlights(element, text, matches) {
    this.removeHighlights(element);
    
    const overlayId = `prompt-scrubber-overlay-${Date.now()}`;
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'prompt-scrubber-overlay';
    
    const computedStyle = window.getComputedStyle(element);
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      font-family: ${computedStyle.fontFamily};
      font-size: ${computedStyle.fontSize};
      line-height: ${computedStyle.lineHeight};
      padding: ${computedStyle.padding};
      border: 1px solid transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow: hidden;
      background: transparent;
    `;
    
    element.parentElement.style.position = 'relative';
    element.parentElement.appendChild(overlay);
    
    matches.forEach(match => {
      const lineHeight = parseInt(computedStyle.lineHeight);
      const linePosition = this.getLinePosition(text, match.index, lineHeight);
      
      const span = document.createElement('span');
      span.className = 'prompt-scrubber-highlight';
      span.style.position = 'absolute';
      span.style.left = '0';
      span.style.width = '100%';
      span.style.height = '1.2em';
      span.style.top = `${linePosition}px`;
      overlay.appendChild(span);
    });
  }

  removeHighlights(element) {
    const overlay = element.parentElement?.querySelector('.prompt-scrubber-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  getLinePosition(text, index, lineHeight) {
    const lines = text.substr(0, index).split('\n');
    return (lines.length - 1) * lineHeight;
  }
}