import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { showToast } from '../utils/toastUtils'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()
  const { upgradePlan } = useSubscriptionStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'
  const intendedPlan = location.state?.plan

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      showToast.success('Welcome back!', { title: 'Login Successful' })
      
      // Check if user intended to upgrade to a plan
      if (intendedPlan) {
        try {
          const upgradeResult = await upgradePlan(intendedPlan)
          
          if (upgradeResult.success && upgradeResult.data?.checkout_url) {
            showToast.loading('Redirecting to secure checkout...')
            window.location.href = upgradeResult.data.checkout_url
            return
          } else {
            throw new Error(upgradeResult.error || 'Failed to create checkout session')
          }
        } catch (error) {
          console.error('Post-login upgrade error:', error)
          showToast.error('Login successful, but unable to process upgrade. Please try again from your dashboard.', {
            title: 'Upgrade Failed'
          })
          navigate('/dashboard', { replace: true })
          return
        }
      }
      
      navigate(from, { replace: true })
    } else {
      if (result.error?.includes('Email not confirmed')) {
        showToast.critical(
          'Please check your email and click the confirmation link before signing in. If you haven\'t received the email, please check your spam folder.',
          {
            title: 'Email Confirmation Required',
            onAcknowledge: () => {
              // Could redirect to a resend confirmation page
              console.log('User acknowledged email confirmation requirement')
            }
          }
        )
      } else {
        showToast.error(result.error || 'Login failed', {
          title: 'Login Failed'
        })
      }
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen text-white py-20 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl text-gray-300">
            {intendedPlan 
              ? `Sign in to upgrade to ${intendedPlan.charAt(0).toUpperCase() + intendedPlan.slice(1)} plan`
              : 'Sign in to your Privly account'
            }
          </p>
          {intendedPlan && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-primary-light">
                After signing in, you'll be redirected to complete your {intendedPlan} plan upgrade.
              </p>
            </div>
          )}
        </div>

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
                  placeholder="Your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary-light">
                  Sign up
                </Link>
              </p>
              
              <p className="text-gray-400">
                <Link to="/forgot-password" className="text-primary hover:text-primary-light">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}