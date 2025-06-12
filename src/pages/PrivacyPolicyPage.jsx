import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 mb-8">
            Last updated: January 15, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                At Prompt-Scrubber, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our browser extension and web application. 
                Our core principle is that your sensitive data never leaves your device.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Information We DO NOT Collect</h3>
                  <p className="text-gray-300 mb-2">
                    <strong>Most importantly, we never collect:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Your prompt text or any content you type</li>
                    <li>Your custom rules or sensitive data patterns</li>
                    <li>Any data that our extension detects or masks</li>
                    <li>Your browsing history or website content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Information We Do Collect</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>Account Information:</strong> Email address, encrypted password, subscription plan</li>
                    <li><strong>Usage Statistics:</strong> Number of scrub actions performed (count only, not content)</li>
                    <li><strong>Technical Information:</strong> Browser type, extension version, error logs</li>
                    <li><strong>Billing Information:</strong> Processed securely by Stripe (we don't store payment details)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the limited information we collect for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Providing and maintaining our service</li>
                <li>Managing your subscription and billing</li>
                <li>Enforcing usage limits based on your plan</li>
                <li>Providing customer support</li>
                <li>Improving our service through anonymized analytics</li>
                <li>Communicating important service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Data Storage and Security</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Local Storage</h3>
                  <p className="text-gray-300">
                    All your sensitive data, custom rules, and scrub history are stored locally on your device using 
                    client-side encryption. We use AES-256-GCM encryption with PBKDF2 key derivation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Server Storage</h3>
                  <p className="text-gray-300">
                    Our servers only store your account information, subscription details, and usage statistics. 
                    All data is encrypted in transit and at rest.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Security Measures</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>End-to-end encryption for all sensitive data</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>SOC 2 Type II compliance (in progress)</li>
                    <li>Secure development practices and code reviews</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (they handle all payment data securely)</li>
                <li><strong>Google Analytics:</strong> Anonymized website analytics (no personal data)</li>
                <li><strong>Intercom:</strong> Customer support chat (only when you initiate contact)</li>
                <li><strong>AWS:</strong> Secure cloud hosting with encryption at rest</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Account Data</h3>
                  <p className="text-gray-300">
                    We retain your account information for as long as your account is active or as needed to provide services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Usage Statistics</h3>
                  <p className="text-gray-300">
                    Usage statistics are retained for up to 2 years for analytics and service improvement.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Local Data</h3>
                  <p className="text-gray-300">
                    Data stored locally on your device (custom rules, history) is retained according to your plan limits 
                    and can be deleted by you at any time.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">International Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are hosted in the United States. If you are accessing our services from outside the US, 
                please be aware that your information may be transferred to, stored, and processed in the US where our 
                servers are located and our central database is operated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300">
                  <strong>Email:</strong> privacy@prompt-scrubber.com<br />
                  <strong>Address:</strong> [Company Address]<br />
                  <strong>Data Protection Officer:</strong> dpo@prompt-scrubber.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}