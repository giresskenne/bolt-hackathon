import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from 'lucide-react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const faqData = [
    {
      question: "What happens when I reach my quota?",
      answer: "On the Free plan, scrubbing will be disabled until the next month. Pro users have unlimited scrubs. You'll receive notifications as you approach your limits."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All processing happens locally in your browser. We never see, store, or transmit your sensitive data. Your custom rules are encrypted and stored locally on your device."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans, no questions asked. Contact our support team to process your refund."
    },
    {
      question: "How does the extension work?",
      answer: "Prompt-Scrubber runs locally in your browser and scans text as you type. When sensitive data is detected, it highlights the text and offers a 'Scrub' button to mask the information before you send it."
    },
    {
      question: "Which websites are supported?",
      answer: "Free plan supports ChatGPT, Claude, Gemini, and Copilot. Pro plan works on any website via allow-list. Enterprise includes organization-wide policy control."
    },
    {
      question: "Can I add custom patterns?",
      answer: "Yes! You can create custom rules to detect organization-specific sensitive data. Free plan includes 25 custom rules, Pro includes 100, and Enterprise has unlimited rules."
    },
    {
      question: "How accurate is the detection?",
      answer: "Our detection engine uses 30+ built-in patterns with high accuracy. Pro plan includes AI heuristic detection for even better results. You can also fine-tune with custom rules."
    },
    {
      question: "Does it work offline?",
      answer: "Yes! All detection and masking happens locally in your browser, so it works even without an internet connection. Only license validation requires connectivity."
    },
    {
      question: "Can I recover scrubbed data?",
      answer: "Pro and Enterprise plans include encrypted local history with undelete functionality. Free plan keeps history for 24 hours. You can always undo recent scrub actions."
    }
  ]

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-primary-light">Questions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about Prompt-Scrubber, our pricing, features, and how we protect your sensitive data.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-primary/30"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset group"
              >
                <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-primary-light transition-colors">
                  {item.question}
                </h3>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  {openItems[index] ? (
                    <ChevronUp className="w-5 h-5 text-primary-light" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-light transition-colors" />
                  )}
                </div>
              </button>
              
              {openItems[index] && (
                <div className="px-8 pb-6">
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-300 mb-8">
              Can't find the answer you're looking for? Our support team is here to help you get the most out of Prompt-Scrubber.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Support</h3>
                  <p className="text-sm text-gray-400">Get help via email</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Send us a detailed message and we'll get back to you within 24 hours.
              </p>
              <button className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-colors w-full">
                <Link to="/contact?type=general" className="block">
                  Contact Support
                </Link>
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Phone className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Live Chat</h3>
                  <p className="text-sm text-gray-400">Chat with our team</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Get instant help from our support team during business hours.
              </p>
              <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors w-full">
                Start Chat
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              <strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM PST<br />
              <strong>Average Response Time:</strong> Under 4 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}