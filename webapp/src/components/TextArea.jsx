import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../../extension/icons/Logo.png';

const TextArea = () => {
  return (
    <div className="min-h-screen bg-discord-hero text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={Logo}
                alt="Prompt-Scrubber Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">Prompt-Scrubber Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="hover:text-primary-light transition-colors">← Back to Home</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Try <span className="text-primary-light">Prompt-Scrubber</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Type or paste any text below to see how Prompt-Scrubber protects your sensitive information in real-time
            </p>
          </div>

          {/* Demo Interface */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6">
              <textarea
                className="w-full min-h-[300px] bg-white/10 text-white rounded-xl p-4 border border-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder="Start typing or paste your text here..."
              />
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-6 text-center text-gray-400">
            <p>Try entering sensitive information like:</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-white/5 rounded-full text-sm">Email Addresses</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-sm">Phone Numbers</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-sm">API Keys</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-sm">Credit Cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextArea;
