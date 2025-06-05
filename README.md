# Prompt-Scrubber

Masks secrets/PII inside chat and textarea fields in real time.

Prompt-Scrubber is a Chrome extension that automatically detects and masks sensitive information like API keys, tokens, emails, and credit card numbers in text input fields as you type.

## Installation

To install the extension in development mode:

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be active

## Features

- Real-time detection and masking of sensitive information
- Works with textarea elements and contenteditable fields (like chat boxes)
- Toggle to enable/disable protection
- Visual feedback when sensitive content is detected

## Protected Patterns

The extension currently detects and masks the following patterns:

1. **AWS API Keys**: `AKIA[0-9A-Z]{16}`
2. **API Tokens**: `\b[0-9a-fA-F]{32,}\b`
3. **Email Addresses**: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`
4. **Credit Card Numbers**: `\b(?:\d[ -]*?){13,16}\b`
5. **OpenAI API Keys**: `sk-[a-zA-Z0-9]{32,}`

## Customization

To add or modify the patterns:

1. Open `scripts/config.js`
2. Add or modify entries in the `patterns` array
3. Each pattern should include:
   - `name`: A descriptive name
   - `regex`: The regular expression to match
   - `replacement`: The text to replace matches with

## Privacy

All detection and masking happens locally in your browser. No data is sent to any server.

## License

MIT