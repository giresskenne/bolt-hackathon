import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Shield, Eye, EyeOff, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signup, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    plan: searchParams.get('plan') || 'free'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    const result = await signup(formData.email, formData.password, formData.plan)
    
    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Signup failed')
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const planFeatures = {
    free: [
      '800 scrub actions per month',
      '25 custom rules',
      '20 built-in patterns',
      'Community support'
    ],
    pro: [
      'Unlimited scrub actions',
      '100 custom rules',
      '100+ patterns + AI detection',
      'Priority support'
    ]
  }

  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-xl text-gray-300">
            Join thousands protecting their sensitive data with Prompt-Scrubber
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Signup Form */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-medium mb-2">
                  Select Plan
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="free" className="bg-gray-800">Free Plan</option>
                  <option value="pro" className="bg-gray-800">Pro Plan - $7/month</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="spinner"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-light">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          {/* Plan Details */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">
              {formData.plan === 'pro' ? 'Pro Plan' : 'Free Plan'} Features
            </h3>
            
            <ul className="space-y-4 mb-8">
              {planFeatures[formData.plan]?.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {formData.plan === 'free' && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-primary-light">
                  💡 You can upgrade to Pro anytime from your dashboard to unlock unlimited scrubs and advanced features.
                </p>
              </div>
            )}

            {formData.plan === 'pro' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-400">
                  🎉 Start with a 14-day free trial. Cancel anytime, no questions asked.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center text-sm text-gray-400">
          By creating an account, you agree to our{' '}
          <Link to="/terms-of-service" className="text-primary hover:text-primary-light">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="text-primary hover:text-primary-light">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}