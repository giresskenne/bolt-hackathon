import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { 
  Shield, 
  TrendingUp, 
  Settings, 
  Calendar, 
  Activity,
  Plus,
  Trash2,
  Edit,
  Crown,
  Zap,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
   const { user } = useAuthStore()
   const [searchParams] = useSearchParams()
   const navigate = useNavigate()
  const { 
     plan, 
     subscriptionStatus,
     isSubscriptionLoading,
     extensionUsage,
     customRules,
     scrubHistory,
     isExtensionDataLoading,
     extensionConnected,
     limits,
     fetchExtensionData,
    fetchSubscriptionStatus,
     addCustomRule,
     deleteCustomRule,
     canPerformAction,
     getUsagePercentage,
     upgradePlan
  } = useSubscriptionStore()

  // On mount or when user changes, fetch subscription & extension data
  useEffect(() => {
    let initialTimer;
    if (user) {
      fetchSubscriptionStatus()
      initialTimer = setTimeout(() => {
        fetchExtensionData()
      }, 500)
    }
    return () => clearTimeout(initialTimer)
  }, [user, fetchSubscriptionStatus, fetchExtensionData])

  const [upgradeLoading, setUpgradeLoading] = useState(false)

  // ─────────────────────────────────────────────────────────────
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = async () => {
    await fetchExtensionData()
    if (!extensionConnected) setRetryCount((n) => n + 1)   // bump on failure
  }
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    // Handle Stripe success redirect
    const upgradeStatus = searchParams.get('upgrade')
    const sessionId = searchParams.get('session_id')
    
    if (upgradeStatus === 'success' && sessionId) {
      // Check if we've already shown a toast for this session ID
      const toastKey = `upgrade_toast_${sessionId}`
      const hasShownToast = sessionStorage.getItem(toastKey)
      
      if (!hasShownToast) {
        // Mark this session as having shown a toast
        sessionStorage.setItem(toastKey, 'true')
        
        // Show success message
        toast.success('🎉 Successfully upgraded to Pro! Welcome to unlimited scrubbing!')
        
        // Refresh extension data to get updated plan
        fetchExtensionData()
      }
      
      // Clean up URL by removing query parameters (always do this)
      navigate('/dashboard', { replace: true })
    } else if (upgradeStatus === 'cancelled') {
      // Handle cancelled checkout
      toast.error('Upgrade cancelled. You can try again anytime.')
      navigate('/dashboard', { replace: true })
    }
  }, [searchParams, navigate, fetchExtensionData])

  // Refresh extension data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== 'hidden' && extensionConnected) {
        fetchExtensionData()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [extensionConnected, fetchExtensionData])

  const currentLimits = limits[plan]
  const [scrubUsagePercent, setScrubUsagePercent] = useState(0)
  const [rulesUsagePercent, setRulesUsagePercent] = useState(0)

  // Load usage percentages
  useEffect(() => {
    let isMounted = true
    const loadUsagePercentages = async () => {
      try {
        const [scrubPercent, rulesPercent] = await Promise.all([
          getUsagePercentage('scrubsThisMonth'),
          getUsagePercentage('customRules')
        ])
        if (isMounted) {
          setScrubUsagePercent(scrubPercent)
          setRulesUsagePercent(rulesPercent)
        }
      } catch (error) {
        console.error('Failed to load usage percentages:', error)
      }
    }

    if (extensionConnected) {
      loadUsagePercentages()
    }
    return () => { isMounted = false }
  }, [extensionConnected, getUsagePercentage])

  const handleDeleteRule = async (id) => {
    try {
      const result = await deleteCustomRule(id)
      if (result.success) {
        toast.success('Custom rule deleted')
        // Refresh extension data to get updated usage
        fetchExtensionData()
      } else {
        toast.error(result.error || 'Failed to delete custom rule')
      }
    } catch (error) {
      console.error('Delete rule error:', error)
      toast.error('Failed to delete custom rule')
    }
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const result = await upgradePlan('pro')
      
      if (result.success && result.data?.checkout_url) {
        // Show loading message and redirect to Stripe checkout
        toast.success('Redirecting to checkout...')
        window.location.href = result.data.checkout_url
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Unable to process upgrade. Please try again.')
      setUpgradeLoading(false)
    }
  }

  const getPlanBadge = () => {
    const badges = {
      free: { text: 'Free', color: 'bg-gray-500', icon: Shield },
      pro: { text: 'Pro', color: 'bg-primary', icon: Crown },
      enterprise: { text: 'Enterprise', color: 'bg-purple-600', icon: Zap }
    }
    
    const badge = badges[plan]
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span>{badge.text}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        {(isSubscriptionLoading || isExtensionDataLoading) && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="spinner"></div>
              <span className="text-blue-400">
                {isSubscriptionLoading ? 'Loading subscription information...' : 'Loading extension data...'}
              </span>
            </div>
          </div>
        )}

        {/* Extension Connection Status */}


        {!extensionConnected && !isExtensionDataLoading && (
          <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* icon + copy */}
              <div className="flex flex-1 items-start gap-3">
                <WifiOff className="h-5 w-5 shrink-0 text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-400">Extension Not Connected</p>
                  <p className="text-sm text-gray-300">
                    Install or enable the Privly extension to sync your custom rules and usage data.
                  </p>
                
                  {/* ▼ refresh hint appears after ≥1 failed retry */}
                  {retryCount > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      Still not working?{' '}
                      <button
                        onClick={() => window.location.reload()}
                        className="underline hover:text-yellow-300"
                      >
                        refresh the page
                      </button>
                      .
                    </p>
                  )}
                </div>
              </div>
                
              {/* primary action */}
              <button
                onClick={handleRetry}
                className="shrink-0 rounded-lg bg-yellow-600 px-4 py-2 font-semibold transition-colors hover:bg-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}


        {extensionConnected && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Extension Connected</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-300">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {getPlanBadge()}
            {plan === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {upgradeLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Scrubs This Month */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                {extensionUsage.scrubsThisMonth}
                {currentLimits.scrubsPerMonth !== -1 && (
                  <span className="text-sm text-gray-400 font-normal">
                    /{currentLimits.scrubsPerMonth}
                  </span>
                )}
              </span>
            </div>
            <h3 className="font-semibold mb-2">Scrubs This Month</h3>
            {currentLimits.scrubsPerMonth !== -1 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    scrubUsagePercent > 80 ? 'bg-red-500' : 
                    scrubUsagePercent > 60 ? 'bg-yellow-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(scrubUsagePercent, 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Custom Rules */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold">
                {customRules.length}
                {currentLimits.customRules !== -1 && (
                  <span className="text-sm text-gray-400 font-normal">
                    /{currentLimits.customRules}
                  </span>
                )}
              </span>
            </div>
            <h3 className="font-semibold mb-2">Custom Rules</h3>
            {currentLimits.customRules !== -1 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    rulesUsagePercent > 80 ? 'bg-red-500' : 
                    rulesUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(rulesUsagePercent, 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Built-in Patterns */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-2xl font-bold">{currentLimits.patterns}</span>
            </div>
            <h3 className="font-semibold mb-2">Built-in Patterns</h3>
            <p className="text-sm text-gray-400">
              {plan === 'pro' ? 'Advanced + AI detection' : 'Core patterns'}
            </p>
          </div>

          {/* Plan Status */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-sm font-semibold text-green-400">Active</span>
            </div>
            <h3 className="font-semibold mb-2">Plan Status</h3>
            <p className="text-sm text-gray-400">
              {plan === 'free' ? 'Free forever' : 
               subscriptionStatus === 'trial' ? 'Trial period' :
               subscriptionStatus === 'active' ? 'Active subscription' :
               subscriptionStatus === 'past_due' ? 'Payment overdue' :
               'Subscription inactive'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Custom Rules Management */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Custom Rules</h2>
            </div>

            {!extensionConnected && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm">
                    Extension required to manage custom rules
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {customRules.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No custom rules yet</p>
                  <p className="text-sm">Add rules to protect your specific sensitive data</p>
                </div>
              ) : (
                customRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rule.value}</p>
                      <p className="text-sm text-gray-400">→ &lt;{rule.label}&gt;</p>
                    </div>
                    {/* <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={!extensionConnected}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div> */}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scrubHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Your scrubbing history will appear here</p>
                </div>
              ) : (
                scrubHistory.slice(0, 10).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action || 'Scrub action'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {activity.count || 1} items
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link
            to="/account/billing"
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Manage Billing</h3>
            <p className="text-sm text-gray-400">Update payment methods and view invoices</p>
          </Link>

          <Link
            to="/docs"
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-gray-400">Learn how to get the most out of Privly</p>
          </Link>

          <Link
            to="/faq"
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Settings className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Help & FAQ</h3>
            <p className="text-sm text-gray-400">Find answers to common questions</p>
          </Link>
        </div>
      </div>
    </div>
  )
}