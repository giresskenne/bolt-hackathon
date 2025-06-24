import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSubscriptionStore } from './store/subscriptionStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BillingPage from './pages/BillingPage'
import DocsPage from './pages/DocsPage'
import FAQPage from './pages/FAQPage'
import ContactPage from './pages/ContactPage'
import EnterprisePage from './pages/EnterprisePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import UserSettingsPage from './pages/UserSettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import TextArea from './components/TextArea'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { fetchSubscriptionStatus } = useSubscriptionStore()

  // Check authentication on app load
  React.useEffect(() => {
    const { checkAuth } = useAuthStore.getState()
    checkAuth()
    
    // Set up subscription status fetching after auth state changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && !state.isLoading) {
        fetchSubscriptionStatus()
      }
    })
    
    return unsubscribe
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="enterprise" element={<EnterprisePage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
        <Route path="cookie-policy" element={<CookiePolicyPage />} />
        <Route path="demo" element={<TextArea />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="account/billing" element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        } />
        <Route path="account/settings" element={
          <ProtectedRoute>
            <UserSettingsPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App