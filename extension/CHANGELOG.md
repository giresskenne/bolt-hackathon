# Changelog

All notable changes to Prompt-Scrubber will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive changelog documentation
- Enhanced documentation with detailed feature descriptions

## [0.2.0] - 2025-01-15

### Added
- **Smart Theme Detection**: Automatic adaptation to light and dark modes
  - Detects user's color scheme preference
  - Adapts highlighting colors for better visibility
  - Works with system dark mode and website-specific themes
- **Enhanced Phone Number Detection**: Improved pattern matching for North American phone numbers
  - Now supports dot notation (555.123.4567)
  - Maintains support for dashes, spaces, and parentheses
  - Better handling of international formats (+1 prefix)
- **Comprehensive Test Suite**: Added extensive pattern testing file
  - 30+ different sensitive data patterns
  - Real-world examples and edge cases
  - False positive prevention tests

### Changed
- **Visual Feedback System**: Upgraded highlighting to be theme-aware
  - Light mode: Subtle red gradient on white background
  - Dark mode: Darker red gradient that preserves text readability
  - Eliminates text visibility issues in dark themes
- **Pattern Detection Engine**: Enhanced phone number regex pattern
  - Updated from `[-\\s]?` to `[-\\s.]?` to include dot separators
  - Improved accuracy for various phone number formats

### Fixed
- **Dark Mode Compatibility**: Resolved text visibility issues
  - Fixed white background highlighting covering dark text
  - Improved contrast ratios for better accessibility
- **Phone Number Detection**: Fixed missed patterns
  - Now correctly detects formats like "555.555.0199"
  - Better handling of mixed separator formats

### Technical
- Updated `src/patterns.json` with enhanced phone number pattern
- Modified `src/contentScript.js` with smart theme detection function
- Regenerated `src/gen/redactorRules.js` with updated patterns
- Added comprehensive test file `test-comprehensive-patterns.txt`

## [0.1.0] - 2025-01-01

### Added
- **Initial Release**: Core functionality for sensitive data detection and masking
- **Real-Time Detection**: Automatic scanning of text input as you type
- **Visual Feedback**: Highlighting of text areas containing sensitive information
- **One-Click Scrubbing**: "Scrub" button to instantly mask detected sensitive data
- **Universal Compatibility**: Works across major AI platforms and websites
  - ChatGPT (chat.openai.com)
  - Claude (claude.ai)
  - Google Gemini (gemini.google.com)
  - GitHub Copilot
  - Any website with text inputs

### Pattern Detection
- **Cloud & API Secrets** (12 patterns):
  - AWS Access Keys, Secret Keys, Account IDs, ARNs
  - VPC IDs, EC2 Instance IDs
  - GitHub & GitLab Personal Access Tokens
  - Stripe API Keys (live & test)
  - Slack Bot Tokens
  - Google API Keys
  - JWT Tokens
  - Basic Auth Headers

- **Personal Identifiers** (8 patterns):
  - Email addresses (comprehensive format support)
  - Phone numbers (US/Canada with various separators)
  - Social Security Numbers (US format)
  - Social Insurance Numbers (Canadian format)
  - Passport numbers
  - Credit card numbers (Visa, MasterCard, AmEx, Discover)
  - IBAN bank account numbers

- **Network & Infrastructure** (8 patterns):
  - IPv4 and IPv6 addresses
  - Private network ranges (RFC1918)
  - Internal FQDNs (.corp, .internal, .local, .lan)
  - URLs with embedded credentials
  - RDS endpoints
  - CloudWatch log group ARNs

- **System Identifiers** (4 patterns):
  - UUIDs (v4 format)
  - Kubernetes secrets
  - Environment variable exports

### User Interface
- **Extension Popup**: Clean, professional interface
  - Protection summary with statistics
  - Quick settings toggle
  - Custom rules management
  - Keyboard shortcuts reference
- **Custom Rules System**: User-defined pattern matching
  - Add organization-specific sensitive data patterns
  - Simple value-to-label mapping
  - Persistent storage with sync across devices
- **Keyboard Shortcuts**: Alt+Shift+S for quick scrubbing
- **Statistics Tracking**: Count of masked sensitive items

### Privacy & Security
- **100% Local Processing**: All detection happens in browser
- **No Data Collection**: Zero telemetry or data transmission
- **Secure Storage**: Chrome's built-in storage APIs
- **Open Source**: Full code transparency

### Technical Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Modular Design**: Separated concerns for maintainability
  - Content script for page interaction
  - Background service worker for pattern processing
  - Popup interface for user controls
- **Pattern Engine**: JSON-driven regex compilation
- **Build System**: Webpack-based bundling with auto-generation
- **Cross-Platform**: Works on all Chromium-based browsers

### Browser Support
- Chrome 88+
- Edge 88+
- Brave (Chromium-based)
- Other Chromium-based browsers

---

## Release Notes

### Version Numbering
- **Major versions** (x.0.0): Breaking changes or major feature additions
- **Minor versions** (0.x.0): New features, pattern additions, significant improvements
- **Patch versions** (0.0.x): Bug fixes, minor improvements, documentation updates

### Upgrade Path
- All versions maintain backward compatibility for custom rules
- Pattern updates are automatically applied
- Settings and preferences are preserved across updates

### Future Roadmap
- Additional cloud provider patterns (Azure, GCP)
- International phone number formats
- Advanced regex pattern support for custom rules
- Integration with password managers
- Enterprise features for team deployment

---

*For technical details and development information, see the [README.md](README.md) file.*