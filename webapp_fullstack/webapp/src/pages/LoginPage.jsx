import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { Shield, Eye, EyeOff, Chrome } from 'lucide-react'
import { showToast } from '../utils/toastUtils'
import Logo from '/extension/icons/google_logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, isLoading, isAuthenticated, user } = useAuthStore()
  const { upgradePlan } = useSubscriptionStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'
  const intendedPlan = location.state?.plan

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔵 LoginPage useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);
    if (isAuthenticated && user && !isLoading) {
      console.log('🔵 User already authenticated, redirecting to dashboard...');
      showToast.success(`Welcome back, ${user.email}!`);
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    console.log('🔴 handleGoogleLogin button clicked (existing users only)!');
    console.log('🔴 loginWithGoogle function:', loginWithGoogle);
    console.log('🔴 isLoading:', isLoading);
    
    try {
      console.log('🔴 About to call loginWithGoogle...');
      const result = await loginWithGoogle(intendedPlan)
      console.log('🔴 loginWithGoogle result:', result);
      
      if (result.success) {
        console.log('🔴 Success, showing loading toast');
        showToast.loading('Redirecting to Google...')
      } else {
        console.log('🔴 Failed, showing error toast');
        showToast.error(result.error || 'Google login failed. If you don\'t have an account, please sign up first.', {
          title: 'Google Login Failed'
        })
      }
    } catch (error) {
      console.log('🔴 Exception caught:', error);
      showToast.error('Unable to connect to Google. If you\'re new, please sign up first.', {
        title: 'Connection Error'
      })
    }
  }

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
    <div className="min-h-screen text-white py-10 px-6">
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
            {/* Google Login Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 border border-gray-300"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <img src={Logo} alt="Google Logo" className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
              
              {/* Add note about existing users only */}
              <p className="text-xs text-gray-500 text-center">
                Google sign-in is for existing users only. {" "}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 underline">
                  Create an account
                </Link> if you're new to Privly.
              </p>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/5 px-4 text-gray-400">or continue with email</span>
                </div>
              </div>
            </div>

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