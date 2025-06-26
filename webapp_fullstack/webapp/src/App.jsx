import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSubscriptionStore } from './store/subscriptionStore'
import { showToast } from './utils/toastUtils'
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

import { useEffect } from 'react';
import { supabase } from './store/authStore'       

function App() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { fetchSubscriptionStatus } = useSubscriptionStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const { checkAuth } = useAuthStore.getState();

    const handleRedirectIfNeeded = async () => {
      // Supabase returns ?code=...&state=... on successful OAuth
      if (location.search.includes('code=')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession();
        // for @supabase/supabase-js < 2.33 use:
        // const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })

        if (error) {
          showToast.error(error.message, { title: 'Google sign-in failed' });
          return;
        }

        await checkAuth();                                             // populate the store
        window.history.replaceState({}, document.title, location.pathname);

        showToast.success('Signed in successfully.', { title: 'Welcome back' });
        navigate('/dashboard', { replace: true });
      } else {
        checkAuth();                                                   // regular startup
      }
    };

    handleRedirectIfNeeded();

    // once authorized, fetch subscription details
    const unsub = useAuthStore.subscribe((s) => {
      if (s.isAuthenticated && !s.isLoading) fetchSubscriptionStatus();
    });
    return unsub;                                                      // cleanup
  }, [location.search, navigate, fetchSubscriptionStatus]);


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