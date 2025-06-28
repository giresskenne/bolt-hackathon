import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Zap,
  Clock
} from 'lucide-react'
import { showToast } from '../utils/toastUtils'

export default function BillingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    plan, 
    subscriptionStatus,
    stripeCustomerId,
    trialEndsAt,
    isSubscriptionLoading,
    upgradePlan,
    fetchSubscriptionStatus
  } = useSubscriptionStore()
  const [billingHistory, setBillingHistory] = useState([])
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch subscription status from backend
    fetchSubscriptionStatus()
    
    // Load billing data
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found for billing data');
        return;
      }

      // Fetch billing history and payment methods in parallel
      const [invoicesResponse, paymentMethodsResponse] = await Promise.all([
        fetch('/api/subscription/invoices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/subscription/payment-methods', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      // Handle invoices response
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setBillingHistory(invoicesData);
      } else {
        console.error('Failed to fetch invoices:', invoicesResponse.status);
        setBillingHistory([]);
      }

      // Handle payment methods response
      if (paymentMethodsResponse.ok) {
        const paymentMethodData = await paymentMethodsResponse.json();
        setPaymentMethod(paymentMethodData);
      } else {
        console.error('Failed to fetch payment methods:', paymentMethodsResponse.status);
        setPaymentMethod(null);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error)
      // Set empty states on error
      setBillingHistory([]);
      setPaymentMethod(null);
    }
  }

  const handleUpgrade = async (newPlan) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create Stripe checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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
      showToast.error('Unable to process upgrade. Please try again.', {
        title: 'Upgrade Failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/subscription/create-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      window.location.href = data.portal_url;
    } catch (error) {
      console.error('Portal error:', error);
      showToast.error('Unable to open billing portal. Please try again.', {
        title: 'Portal Error'
      });
    }
  }

  const downloadInvoice = (invoiceId) => {
    // Find the invoice in billing history
    const invoice = billingHistory.find(inv => inv.id === invoiceId);
    
    if (invoice && invoice.invoice_pdf) {
      // Open the Stripe-hosted PDF in a new tab
      window.open(invoice.invoice_pdf, '_blank');
      showToast.success('Invoice opened in new tab', {
        title: 'Download Started'
      });
    } else if (invoice && invoice.invoice_url) {
      // Fallback to hosted invoice URL
      window.open(invoice.invoice_url, '_blank');
      showToast.success('Invoice opened in new tab', {
        title: 'Download Started'
      });
    } else {
      showToast.error('Invoice not available for download', {
        title: 'Download Failed'
      });
    }
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
        {/* Loading State */}
        {isSubscriptionLoading && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="spinner"></div>
              <span className="text-blue-400">Loading subscription information...</span>
            </div>
          </div>
        )}

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
            
            {subscriptionStatus === 'active' && stripeCustomerId && (
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
                {subscriptionStatus === 'active' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-500">Active</span>
                  </>
                ) : subscriptionStatus === 'trial' ? (
                  <>
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-500">Trial</span>
                  </>
                ) : subscriptionStatus === 'past_due' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">Past Due</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-500">Inactive</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Next Billing</p>
              <p className="font-semibold">
                {plan === 'free' ? 'N/A' : 
                 subscriptionStatus === 'trial' && trialEndsAt ? 
                   `Trial ends ${new Date(trialEndsAt).toLocaleDateString()}` :
                   'Next billing cycle'}
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
                  onClick={() => navigate('/contact?type=sales')}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {plan !== 'free' && stripeCustomerId && paymentMethod && (
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
          
          {/* TODO: Replace with real billing history from backend */}
          
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