import React from 'react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 mb-8">
            Last updated: January 15, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Prompt-Scrubber uses cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Strictly Necessary Cookies</h3>
                  <p className="text-gray-300">
                    These cookies are essential for the website to function and cannot be disabled. They include:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Authentication tokens</li>
                    <li>Security tokens</li>
                    <li>Load balancing cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Performance Cookies</h3>
                  <p className="text-gray-300">
                    These cookies collect information about how you use our website to help us improve performance:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Google Analytics (anonymized)</li>
                    <li>Page load times</li>
                    <li>Error tracking</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                  <p className="text-gray-300">
                    These cookies remember your preferences and settings:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>Dashboard layout preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Stripe:</strong> For payment processing and fraud prevention</li>
                <li><strong>Google Analytics:</strong> For website analytics (anonymized)</li>
                <li><strong>Intercom:</strong> For customer support chat</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Browser Settings</h3>
                  <p className="text-gray-300">
                    Most browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Delete cookies when you close your browser</li>
                    <li>Get notified when cookies are set</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
                  <p className="text-gray-300">
                    When you first visit our website, you'll see a cookie consent banner. You can:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Accept all cookies</li>
                    <li>Reject non-essential cookies</li>
                    <li>Customize your cookie preferences</li>
                    <li>Change your preferences at any time</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Cookie Retention</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication Cookies:</strong> 30 days or until logout</li>
                <li><strong>Preference Cookies:</strong> 1 year</li>
                <li><strong>Analytics Cookies:</strong> 2 years (Google Analytics default)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Cookie Policy from time to time. When we do, we will post the updated policy on this page 
                and update the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Cookie Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300">
                  <strong>Email:</strong> privacy@prompt-scrubber.com<br />
                  <strong>Address:</strong> [Company Address]<br />
                  <strong>Phone:</strong> [Company Phone]
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}