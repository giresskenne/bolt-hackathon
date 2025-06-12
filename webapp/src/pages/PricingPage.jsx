import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Star, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for personal use',
      features: [
        '800 scrub actions per month',
        '25 custom regex rules (local only)',
        '20 curated built-in patterns',
        'Last 24h scrub history',
        'Fixed site support (ChatGPT, Claude, Gemini, Copilot)',
        'Community forum support'
      ],
      cta: 'Get Started',
      href: '/signup?plan=free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$7',
      period: 'per month',
      yearlyPrice: '$79',
      yearlyPeriod: 'per year',
      description: 'For power users and professionals',
      features: [
        'Unlimited scrub actions',
        '100 custom regex rules (local only)',
        '100+ advanced built-in patterns',
        'AI heuristic detector (runs locally)',
        '90-day encrypted local history + undelete',
        'Any site via allow-list',
        'Priority email support'
      ],
      cta: 'Start Free Trial',
      href: '/signup?plan=pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Unlimited custom regex rules',
        'Organization-wide rule sharing',
        'Custom retention & audit export',
        'Organization-wide policy control',
        'Dedicated customer success manager',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      href: '/enterprise',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Choose Your <span className="text-primary-light">Protection</span> Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with our free plan and upgrade as your needs grow. All plans include our core protection features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-primary shadow-2xl shadow-primary/20'
                  : 'border-white/10 hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <div className="text-sm text-gray-400">
                    or <span className="text-primary font-semibold">{plan.yearlyPrice}</span> {plan.yearlyPeriod}
                    <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      Save 15%
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-primary'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "What happens when I reach my quota?",
                answer: "On the Free plan, scrubbing will be disabled until the next month. Pro users have unlimited scrubs."
              },
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. All processing happens locally in your browser. We never see or store your sensitive data."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee for all paid plans, no questions asked."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}