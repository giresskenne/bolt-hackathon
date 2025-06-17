import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const { user } = useAuthStore()
  const { plan, upgradePlan } = useSubscriptionStore()
  const [billingHistory, setBillingHistory] = useState([])
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load billing data
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      // Mock billing data - in real app, fetch from API
      setBillingHistory([
        {
          id: 'inv_001',
          date: '2025-01-01',
          amount: '$7.00',
          status: 'paid',
          description: 'Pro Plan - Monthly'
        },
        {
          id: 'inv_002',
          date: '2024-12-01',
          amount: '$7.00',
          status: 'paid',
          description: 'Pro Plan - Monthly'
        }
      ])

      setPaymentMethod({
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025
      })
    } catch (error) {
      console.error('Failed to load billing data:', error)
    }
  }

  const handleUpgrade = async (newPlan) => {
    setLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ plan: newPlan })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Unable to process upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Unable to open billing portal. Please try again.');
    }
  }

  const downloadInvoice = (invoiceId) => {
    // In real app, this would download the actual invoice
    toast.success(`Downloading invoice ${invoiceId}`)
  }

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'pro':
        return <Crown className="w-5 h-5" />
      case 'enterprise':
        return <Zap className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getPlanColor = (planName) => {
    switch (planName) {
      case 'pro':
        return 'text-primary'
      case 'enterprise':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-300">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center ${getPlanColor(plan)}`}>
                {getPlanIcon(plan)}
              </div>
              <div>
                <h2 className="text-xl font-bold capitalize">{plan} Plan</h2>
                <p className="text-gray-400">
                  {plan === 'free' ? 'Free forever' : 'Active subscription'}
                </p>
              </div>
            </div>
            
            {plan !== 'free' && (
              <button
                onClick={handleManageSubscription}
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-500">Active</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Next Billing</p>
              <p className="font-semibold">
                {plan === 'free' ? 'N/A' : 'February 1, 2025'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Amount</p>
              <p className="font-semibold">
                {plan === 'free' ? '$0.00' : '$7.00/month'}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {plan === 'free' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-bold mb-6">Upgrade Your Plan</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold">Pro Plan</h3>
                </div>
                <p className="text-2xl font-bold mb-2">$7<span className="text-sm text-gray-400">/month</span></p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited scrub actions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>100 custom rules</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI heuristic detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-bold">Enterprise</h3>
                </div>
                <p className="text-2xl font-bold mb-2">Custom</p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited custom rules</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Organization-wide sharing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <button
                  onClick={() => window.location.href = '/enterprise'}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {plan !== 'free' && paymentMethod && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Payment Method</h2>
              <button
                onClick={handleManageSubscription}
                className="text-primary hover:text-primary-light transition-colors"
              >
                Update
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold capitalize">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-400">
                  Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6">Billing History</h2>
          
          {billingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No billing history yet</p>
              <p className="text-sm">Your invoices will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{invoice.description}</p>
                      <p className="text-sm text-gray-400">{invoice.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{invoice.amount}</span>
                    <button
                      onClick={() => downloadInvoice(invoice.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}