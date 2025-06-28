import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSubscriptionStore } from './store/subscriptionStore'
import { showToast } from './utils/toastUtils'
import { supabase } from './store/authStore'
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

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchSubscriptionStatus } = useSubscriptionStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
  const { checkAuth } = useAuthStore.getState();

  // Initialize auth state
  checkAuth();

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.email);
    console.log('Full session object:', session);
    console.log('Current URL:', window.location.href);
    console.log('Local storage token:', localStorage.getItem('token'));
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in successfully:', session.user.email);
      
      // Store tokens
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
      
      // Update auth state
      await checkAuth();
      
      // Clean URL if it has OAuth params
      if (location.search.includes('code=') || location.hash.includes('access_token=')) {
        window.history.replaceState({}, document.title, location.pathname);
      }
      
      // Show success and navigate to dashboard
      showToast.success('Signed in successfully!');
      navigate('/dashboard', { replace: true });
      
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      await checkAuth(); // This will clear the auth state
      
      // Redirect to home if on protected route
      if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/account')) {
        navigate('/', { replace: true });
      }
    } else if (event === 'TOKEN_REFRESHED' && session) {
      console.log('Token refreshed');
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    } else if (event === 'INITIAL_SESSION') {
      console.log('Initial session check completed');
      if (!session) {
        console.log('No initial session found');
      }
    }
  });

  // Cleanup subscription
  return () => {
    subscription?.unsubscribe();
  };
}, [navigate, location]);

  // Fetch subscription status when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchSubscriptionStatus();
    }
  }, [isAuthenticated, isLoading, fetchSubscriptionStatus]);

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