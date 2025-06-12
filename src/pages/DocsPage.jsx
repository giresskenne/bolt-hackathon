import React from 'react'
import { 
  Download, 
  Shield, 
  Key, 
  Lock, 
  Code, 
  Globe, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

export default function DocsPage() {
  const sections = [
    {
      id: 'installation',
      title: 'Installation',
      icon: Download
    },
    {
      id: 'license-ping',
      title: 'License Ping Schema',
      icon: Key
    },
    {
      id: 'encryption',
      title: 'Encryption Overview',
      icon: Lock
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Code
    },
    {
      id: 'supported-sites',
      title: 'Supported Sites',
      icon: Globe
    },
    {
      id: 'custom-rules',
      title: 'Custom Rules',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Developer <span className="text-primary-light">Documentation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to integrate and customize Prompt-Scrubber for your organization
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 sticky top-8">
              <h2 className="text-lg font-bold mb-4">Table of Contents</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-primary group-hover:text-primary-light" />
                      <span className="text-sm group-hover:text-white">{section.title}</span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Installation */}
            <section id="installation" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Download className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Installation</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Chrome Web Store (Recommended)</h3>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                      <li>Visit the <a href="#" className="text-primary hover:text-primary-light">Chrome Web Store</a></li>
                      <li>Click "Add to Chrome"</li>
                      <li>Confirm the installation</li>
                      <li>Pin the extension to your toolbar</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Manual Installation</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm">
                      {`# Download the latest release
wget https://github.com/prompt-scrubber/releases/latest/download/extension.zip

# Extract and load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extracted folder`}
                    </code>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-semibold mb-1">Pro Tip</p>
                      <p className="text-sm text-gray-300">
                        After installation, visit your dashboard to configure custom rules and manage your subscription.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* License Ping Schema */}
            <section id="license-ping" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Key className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">License Ping Schema</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">
                  The extension periodically validates your subscription status with our servers. Here's how the license ping works:
                </p>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Request Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`POST /api/license/ping
Content-Type: application/json

{
  "userId": "user_123",
  "plan": "pro",
  "scrubCountThisMonth": 1250,
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0"
}`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Response Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`{
  "valid": true,
  "plan": "pro",
  "limits": {
    "scrubsPerMonth": -1,
    "customRules": 100,
    "patterns": 100
  },
  "renewalDate": "2025-02-01T00:00:00Z"
}`}
                    </code>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">Privacy Note</p>
                      <p className="text-sm text-gray-300">
                        License pings only contain usage statistics. No sensitive data or custom rules are transmitted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Encryption Overview */}
            <section id="encryption" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Encryption Overview</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">
                  Prompt-Scrubber uses client-side encryption to protect your sensitive data and custom rules.
                </p>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Local Storage Encryption</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`// Example: Encrypting custom rules
import { EncryptedStore } from './utils/encryptedStore'

const store = new EncryptedStore('customRules')

// Store encrypted data
await store.set('rules', customRulesArray)

// Retrieve and decrypt
const rules = await store.get('rules')`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Encryption Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Algorithm</h4>
                      <p className="text-sm text-gray-300">AES-256-GCM</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Key Derivation</h4>
                      <p className="text-sm text-gray-300">PBKDF2 with 100,000 iterations</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Salt</h4>
                      <p className="text-sm text-gray-300">Cryptographically random 32 bytes</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Storage</h4>
                      <p className="text-sm text-gray-300">Browser's IndexedDB</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-semibold mb-1">Zero-Knowledge Architecture</p>
                      <p className="text-sm text-gray-300">
                        All encryption happens in your browser. We never have access to your encryption keys or decrypted data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Code className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">API Reference</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">QuotaTracker</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`import { QuotaTracker } from './utils/quotaTracker'

const tracker = new QuotaTracker()

// Check if action is allowed
if (tracker.canPerformAction('scrub')) {
  // Perform scrub action
  tracker.incrementUsage('scrub', 5) // 5 items scrubbed
}

// Get current usage
const usage = tracker.getCurrentUsage()
console.log(usage.scrubsThisMonth) // 1255`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">EncryptedStore</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`import { EncryptedStore } from './utils/encryptedStore'

// Initialize with a namespace
const store = new EncryptedStore('myData')

// Store data (automatically encrypted)
await store.set('sensitiveInfo', { 
  apiKey: 'secret123',
  tokens: ['token1', 'token2']
})

// Retrieve data (automatically decrypted)
const data = await store.get('sensitiveInfo')

// Remove data
await store.remove('sensitiveInfo')

// Clear all data in namespace
await store.clear()`}
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* Supported Sites */}
            <section id="supported-sites" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Supported Sites</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Free Plan Sites</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'ChatGPT', url: 'chat.openai.com', status: 'Full Support' },
                      { name: 'Claude', url: 'claude.ai', status: 'Full Support' },
                      { name: 'Google Gemini', url: 'gemini.google.com', status: 'Full Support' },
                      { name: 'GitHub Copilot', url: 'github.com/copilot', status: 'Full Support' }
                    ].map((site) => (
                      <div key={site.name} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{site.name}</h4>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            {site.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{site.url}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Pro Plan Features</h3>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>All Free plan sites</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Custom allow-list for any website</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Support for custom domains and internal tools</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Works with any text input field</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Custom Rules */}
            <section id="custom-rules" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Custom Rules</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">
                  Create custom rules to protect organization-specific sensitive data that isn't covered by built-in patterns.
                </p>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Rule Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 text-sm whitespace-pre">
{`{
  "value": "ACME-API-KEY-12345",
  "label": "acme-api-key",
  "description": "ACME Corp API Key",
  "createdAt": "2025-01-15T10:30:00Z"
}`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2 text-green-400">✓ Do</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Use descriptive labels (e.g., "company-api-key")</li>
                        <li>• Include the full sensitive value</li>
                        <li>• Test rules before deploying</li>
                        <li>• Regular review and cleanup</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2 text-red-400">✗ Don't</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Use overly broad patterns</li>
                        <li>• Include common words as values</li>
                        <li>• Forget to update expired tokens</li>
                        <li>• Share rules containing real secrets</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Plan Limits</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Free</h4>
                      <p className="text-2xl font-bold text-gray-500 mb-1">25</p>
                      <p className="text-sm text-gray-400">Custom rules</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Pro</h4>
                      <p className="text-2xl font-bold text-primary mb-1">100</p>
                      <p className="text-sm text-gray-400">Custom rules</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">Enterprise</h4>
                      <p className="text-2xl font-bold text-purple-500 mb-1">∞</p>
                      <p className="text-sm text-gray-400">Unlimited + sharing</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}