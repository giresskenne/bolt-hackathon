import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { 
    plan, 
    usage, 
    limits, 
    updateUsage, 
    canPerformAction, 
    getUsagePercentage,
    upgradePlan 
  } = useSubscriptionStore()

  const [customRules, setCustomRules] = useState([])
  const [newRule, setNewRule] = useState({ value: '', label: '' })
  const [recentActivity, setRecentActivity] = useState([])
  const [showAddRule, setShowAddRule] = useState(false)

  useEffect(() => {
    // Load custom rules from localStorage (encrypted in real implementation)
    const savedRules = localStorage.getItem('customRules')
    if (savedRules) {
      setCustomRules(JSON.parse(savedRules))
    }

    // Load recent activity
    const savedActivity = localStorage.getItem('recentActivity')
    if (savedActivity) {
      setRecentActivity(JSON.parse(savedActivity))
    }
  }, [])

  const currentLimits = limits[plan]
  const scrubUsagePercent = getUsagePercentage('scrubsThisMonth')
  const rulesUsagePercent = getUsagePercentage('customRules')

  const handleAddRule = (e) => {
    e.preventDefault()
    
    if (!canPerformAction('addCustomRule')) {
      toast.error(`Custom rule limit reached (${currentLimits.customRules})`)
      return
    }

    if (!newRule.value.trim() || !newRule.label.trim()) {
      toast.error('Please fill in both value and label')
      return
    }

    const rule = {
      id: Date.now(),
      value: newRule.value.trim(),
      label: newRule.label.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedRules = [...customRules, rule]
    setCustomRules(updatedRules)
    localStorage.setItem('customRules', JSON.stringify(updatedRules))
    
    updateUsage('customRules', 1)
    setNewRule({ value: '', label: '' })
    setShowAddRule(false)
    toast.success('Custom rule added successfully')
  }

  const handleDeleteRule = (id) => {
    const updatedRules = customRules.filter(rule => rule.id !== id)
    setCustomRules(updatedRules)
    localStorage.setItem('customRules', JSON.stringify(updatedRules))
    updateUsage('customRules', -1)
    toast.success('Custom rule deleted')
  }

  const handleUpgrade = async () => {
    const result = await upgradePlan('pro')
    if (result.success) {
      toast.success('Successfully upgraded to Pro!')
    } else {
      toast.error('Upgrade failed. Please try again.')
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
    <div className="min-h-screen text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
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
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Pro
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
                {usage.scrubsThisMonth}
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
              {plan === 'free' ? 'Free forever' : 'Renews monthly'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Custom Rules Management */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Custom Rules</h2>
              <button
                onClick={() => setShowAddRule(true)}
                disabled={!canPerformAction('addCustomRule')}
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            </div>

            {showAddRule && (
              <form onSubmit={handleAddRule} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Value to Replace</label>
                    <input
                      type="text"
                      value={newRule.value}
                      onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g., my-secret-key"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Label</label>
                    <input
                      type="text"
                      value={newRule.label}
                      onChange={(e) => setNewRule(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g., api-key"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRule(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
                      <p className="text-sm text-gray-400">→ <{rule.label}></p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Your scrubbing history will appear here</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {activity.count} items
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
            <p className="text-sm text-gray-400">Learn how to get the most out of Prompt-Scrubber</p>
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