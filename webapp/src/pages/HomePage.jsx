import React from 'react'
import { Link } from 'react-router-dom'
import { Download, Play, Eye, Palette, MousePointerClick, Settings, Globe, Shield } from 'lucide-react'
import Logo from '/extension/icons/Logo.png'
import HeroImage from '/assets/image copy-BoyRcw_C.png'

export default function HomePage() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-up">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Protect Your
                <span className="bg-gradient-to-r from-primary-light to-purple-400 bg-clip-text text-transparent">
                  {' '}Sensitive Data
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Automatically detect confidential information as you type or paste
                while offering you the freedom to set your own custom rules
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primary-dark px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 animate-glow text-center"
                >
                  <Download className="w-5 h-5 inline mr-2" />
                  Get Started Free
                </Link>
                <Link
                  to="/demo"
                  className="border border-white/30 hover:border-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  View Demo
                </Link>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative animate-bounce-slow">
                <img 
                  src={HeroImage}
                  alt="Chat AI Interface with Prompt-Scrubber Protection"
                  className="w-full h-auto rounded-3xl shadow-2xl border border-white/20"
                />

                {/* Auto-detect Badge */}
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 animate-float-badge-delay">
                  <div className="flex items-center space-x-2">
                    <i data-lucide="eye" className="w-4 h-4 text-primary"></i>
                    <span className="text-sm font-medium">Auto-detect</span>
                  </div>
                </div>

                {/* One-click Badge */}
                <div className="absolute -right-4 top-1/3 bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 animate-float-badge-delay">
                  <div className="flex items-center space-x-2">
                    <i data-lucide="eye" className="w-4 h-4 text-primary"></i>
                    <span className="text-sm font-medium">One-click</span>
                  </div>
                </div>

                {/* Protected Badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-blue-600/90 backdrop-blur-sm rounded-xl px-4 py-1.5 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-sm font-normal text-white">Protected</span>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">30+</div>
                      <div className="text-xs text-gray-300">Patterns</div>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">100%</div>
                      <div className="text-xs text-gray-300">Local</div>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">Real-time</div>
                      <div className="text-xs text-gray-300">Detection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Powerful <span className="text-primary-light">Protection</span> Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced detection algorithms protect your sensitive information across all platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Eye,
                title: "Real-Time Detection",
                description: "Instantly identifies sensitive data as you type in any text field across all websites and AI platforms."
              },
              {
                icon: Palette,
                title: "Smart Theme Detection",
                description: "Automatically adapts highlighting colors for perfect visibility in both light and dark modes."
              },
              {
                icon: MousePointerClick,
                title: "One-Click Scrubbing",
                description: "Clean button to instantly mask all detected sensitive information with a single click."
              },
              {
                icon: Settings,
                title: "Custom Rules",
                description: "Add your own patterns for organization-specific sensitive data with simple value-to-label mapping."
              },
              {
                icon: Shield,
                title: "100% Local Processing",
                description: "All detection happens in your browser. No data is ever sent to external servers."
              },
              {
                icon: Globe,
                title: "Universal Compatibility",
                description: "Works across ChatGPT, Claude, Gemini, Copilot, and any website with text inputs."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to <span className="text-primary-light">Protect</span> Your Data?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of users who trust Prompt-Scrubber to keep their sensitive information safe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-primary hover:bg-primary-dark px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 animate-glow"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="border border-white/30 hover:border-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8">
                <img src={Logo} alt="Prompt-Scrubber Logo" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold">Prompt-Scrubber</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <Link to="/privacy-policy" className="hover:text-primary-light transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-primary-light transition-colors">Terms of Service</Link>
              <Link to="/enterprise" className="hover:text-primary-light transition-colors">Enterprise</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 Prompt-Scrubber. All rights reserved. Stay Safe, Stay Private 🛡️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}