# Prompt-Scrubber

A powerful Chrome extension that automatically detects and masks sensitive information like API keys, tokens, emails, credit card numbers, and personally identifiable information (PII) in text input fields as you type.

## 🚀 Features

### Real-Time Protection
- **Automatic Detection**: Instantly identifies sensitive data as you type in any text field
- **Visual Feedback**: Smart theme-aware highlighting that adapts to light and dark modes
- **One-Click Scrubbing**: Clean button to mask all detected sensitive information
- **Universal Compatibility**: Works across all major AI platforms (ChatGPT, Claude, Gemini, Copilot) and any website

### Comprehensive Pattern Detection

**Cloud & API Secrets:**
- AWS Access Keys, Secret Keys, Account IDs, ARNs, VPC/EC2 IDs
- GitHub & GitLab Personal Access Tokens
- Stripe API Keys (live & test)
- Slack Bot Tokens
- Google API Keys
- JWT Tokens
- Basic Auth Headers

**Personal Identifiers:**
- Email addresses (all formats)
- Phone numbers (US/Canada with dots, dashes, spaces, parentheses)
- Social Security Numbers (US format)
- Social Insurance Numbers (Canadian format)
- Passport numbers
- Credit card numbers (Visa, MasterCard, AmEx, Discover)
- IBAN bank account numbers

**Network & Infrastructure:**
- IPv4 and IPv6 addresses
- Private network ranges (RFC1918)
- Internal FQDNs (.corp, .internal, .local, .lan)
- URLs with embedded credentials
- RDS endpoints
- CloudWatch log group ARNs

**System Identifiers:**
- UUIDs (v4 format)
- Kubernetes secrets
- Environment variable exports
- Database connection strings

### Smart Features
- **Theme Detection**: Automatically adapts highlighting colors for light and dark modes
- **Custom Rules**: Add your own patterns for organization-specific sensitive data
- **Keyboard Shortcuts**: Alt+Shift+S to quickly scrub current text
- **Privacy First**: All processing happens locally - no data sent to servers
- **Statistics Tracking**: Monitor how many sensitive items have been protected

### User Interface
- **Popup Dashboard**: View protection summary and manage settings
- **Custom Mappings**: Create personalized rules for your specific use cases
- **Toggle Control**: Easily enable/disable protection
- **Visual Indicators**: Clear feedback when sensitive content is detected

## 🛠 Installation

### For Development
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions`
5. Enable "Developer mode" in the top-right corner
6. Click "Load unpacked" and select the extension directory
7. The extension will be active and ready to protect your sensitive data

### For Production
*Coming soon to Chrome Web Store*

## 🎯 How It Works

1. **Detection**: As you type in any text field, the extension scans for sensitive patterns
2. **Highlighting**: Detected sensitive content triggers subtle visual feedback
3. **Protection**: Click the "Scrub" button to instantly mask all sensitive information
4. **Customization**: Add custom rules for organization-specific patterns

## 🔧 Customization

### Adding Custom Rules
1. Click the extension icon in your browser toolbar
2. Navigate to "All Settings" → "Custom PII Rules"
3. Add your custom patterns:
   - **Value to Replace**: The exact text you want masked
   - **Label**: A friendly name for the replacement (e.g., "my-api-key")

Example:
- Value: `my-secret-token-12345`
- Label: `company-token`
- Result: `<company-token>` replaces the original value

### Keyboard Shortcuts
- **Alt+Shift+S**: Scrub sensitive content in the currently focused text field

## 🔒 Privacy & Security

- **100% Local Processing**: All detection and masking happens in your browser
- **No Data Collection**: We never see, store, or transmit your sensitive information
- **Open Source**: Full transparency - review the code yourself
- **Secure Storage**: Custom rules are stored locally using Chrome's secure storage APIs

## 🌐 Supported Platforms

**AI Platforms:**
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Google Gemini (gemini.google.com)
- GitHub Copilot
- And any other website with text inputs

**Input Types:**
- Textarea elements
- Contenteditable fields
- Rich text editors
- Chat interfaces

## 📊 Pattern Examples

The extension detects patterns like:
```
AWS Keys: AKIAIOSFODNN7EXAMPLE
Emails: user@company.com
Phones: 555.123.4567, (555) 123-4567, +1-555-123-4567
SSNs: 123-45-6789
Credit Cards: 4111-1111-1111-1111
IPs: 192.168.1.100
JWTs: eyJhbGciOiJIUzI1NiIs...
```

## 🚧 Development

### Build Commands
```bash
npm run build    # Production build
npm run dev      # Development build with watch mode
npm run gen      # Generate pattern rules from JSON
```

### Project Structure
```
src/
├── contentScript.js    # Main content script
├── bg.js              # Background service worker
├── redactor.js        # Pattern matching engine
├── patterns.json      # Sensitive data patterns
└── gen/               # Generated files

popup/
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
└── popup.css          # Popup styling
```

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs and issues
- Suggest new patterns or features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - see LICENSE file for details

## 🔄 Version History

- **v0.2.0**: Enhanced phone number detection, theme-aware highlighting
- **v0.1.0**: Initial release with core pattern detection

---

**Stay Safe, Stay Private** 🛡️

Prompt-Scrubber helps you maintain privacy and security when working with AI tools and web applications. Never accidentally share sensitive information again!