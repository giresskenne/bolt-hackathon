import React from 'react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 mb-8">
            Last updated: January 15, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Prompt-Scrubber ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Prompt-Scrubber is a browser extension and web application that helps users identify and mask sensitive 
                information in text inputs before sharing with AI platforms or other online services.
              </p>
              <p className="text-gray-300 leading-relaxed">
                The Service includes both free and paid subscription tiers with different feature sets and usage limits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Account Creation</h3>
                  <p className="text-gray-300">
                    You must provide accurate and complete information when creating an account. You are responsible 
                    for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Account Responsibility</h3>
                  <p className="text-gray-300">
                    You are responsible for all activities that occur under your account. You must notify us immediately 
                    of any unauthorized use of your account.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription Plans and Billing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
                  <p className="text-gray-300">
                    The free plan includes limited usage (800 scrub actions per month) and basic features. 
                    No payment information is required.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Paid Plans</h3>
                  <p className="text-gray-300">
                    Paid subscriptions are billed monthly or annually in advance. All fees are non-refundable except 
                    as required by law or as specifically stated in our refund policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Auto-Renewal</h3>
                  <p className="text-gray-300">
                    Subscriptions automatically renew unless cancelled before the renewal date. You can cancel your 
                    subscription at any time through your account dashboard.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Price Changes</h3>
                  <p className="text-gray-300">
                    We reserve the right to change our pricing with 30 days' notice. Price changes will not affect 
                    your current billing cycle.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use the Service to transmit malware, viruses, or other harmful code</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use the Service to compete with us or create a similar service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Privacy and Data Protection</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Local Processing</h3>
                  <p className="text-gray-300">
                    All sensitive data detection and masking occurs locally on your device. We never see or store 
                    your sensitive data or the content you're protecting.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Data Security</h3>
                  <p className="text-gray-300">
                    We implement appropriate security measures to protect your account information and usage data.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Our Rights</h3>
                  <p className="text-gray-300">
                    The Service and its original content, features, and functionality are owned by Prompt-Scrubber and 
                    are protected by international copyright, trademark, patent, trade secret, and other intellectual 
                    property laws.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
                  <p className="text-gray-300">
                    You retain all rights to your data and custom rules. We do not claim ownership of any content 
                    you create or process using our Service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Service Availability</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We strive to maintain high availability but cannot guarantee uninterrupted service. We may:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Perform scheduled maintenance with advance notice</li>
                <li>Make emergency updates or fixes as needed</li>
                <li>Temporarily suspend service for security or technical reasons</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To the maximum extent permitted by law, Prompt-Scrubber shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
                goodwill, or other intangible losses.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our total liability to you for any claim arising out of or relating to these Terms or the Service shall 
                not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or 
                implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Indemnification</h2>
              <p className="text-gray-300 leading-relaxed">
                You agree to indemnify and hold harmless Prompt-Scrubber and its officers, directors, employees, and 
                agents from any claims, damages, losses, or expenses arising out of your use of the Service or violation 
                of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Termination</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">By You</h3>
                  <p className="text-gray-300">
                    You may terminate your account at any time by contacting us or using the account deletion feature 
                    in your dashboard.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">By Us</h3>
                  <p className="text-gray-300">
                    We may terminate or suspend your account immediately if you violate these Terms or for any other 
                    reason at our sole discretion.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Effect of Termination</h3>
                  <p className="text-gray-300">
                    Upon termination, your right to use the Service will cease immediately. Your local data will remain 
                    on your device, but cloud features will no longer be available.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without 
                regard to its conflict of law provisions. Any disputes shall be resolved in the courts of [Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                via email or through the Service. Your continued use of the Service after such modifications constitutes 
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300">
                  <strong>Email:</strong> legal@prompt-scrubber.com<br />
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