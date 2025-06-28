import React, { useEffect, useState } from 'react'
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
import AuthCallbackPage from './pages/AuthCallbackPage'
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
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchSubscriptionStatus } = useSubscriptionStore();
  const { isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  // Show initial loading screen until the store has hydrated (with timeout fallback)
  const [showHydrationLoading, setShowHydrationLoading] = useState(true);
  
  useEffect(() => {
    // Set a timeout to stop showing hydration loading after 2 seconds max
    const timeout = setTimeout(() => {
      setShowHydrationLoading(false);
    }, 2000);

    // If hydration completes, stop showing loading immediately
    if (_hasHydrated) {
      setShowHydrationLoading(false);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [_hasHydrated]);

  if (showHydrationLoading && !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">Initializing app...</p>
        </div>
      </div>
    );
  }

  // Debug session on component mount
  useEffect(() => {
    const debugSession = async () => {
      console.log('=== DEBUG SESSION INFO ===');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      console.log('Current URL:', window.location.href);
      console.log('Current search params:', window.location.search);
      console.log('Current hash:', window.location.hash);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Manual session check:', { session, error });
      console.log('Session user:', session?.user);
      console.log('Session expires at:', session?.expires_at);
      console.log('Current localStorage token:', localStorage.getItem('token'));
      console.log('Current localStorage refresh_token:', localStorage.getItem('refresh_token'));
      console.log('=== END DEBUG INFO ===');
    };
    
    debugSession();
  }, []);

  useEffect(() => {
    const { checkAuth, _hasHydrated, setHasHydrated } = useAuthStore.getState();

    // Fallback: if hydration hasn't happened after 1 second, force it
    const fallbackTimeout = setTimeout(() => {
      if (!_hasHydrated) {
        console.log('🔄 Fallback: forcing hydration completion');
        setHasHydrated(true);
        checkAuth();
      }
    }, 1000);

    // Only call checkAuth manually if the store hasn't been hydrated yet
    // Otherwise, the onRehydrateStorage callback will handle it
    if (_hasHydrated) {
      checkAuth();
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      console.log('Full session object:', session);
      console.log('Current URL:', window.location.href);
      console.log('Local storage token:', localStorage.getItem('token'));
    
    if (event === 'SIGNED_IN' && session) {
      console.log('✅ User signed in successfully:', session.user.email);
      console.log('✅ Provider:', session.user.app_metadata?.provider);
      
      // Validate OAuth users before proceeding
      if (session.user.app_metadata?.provider === 'google') {
        console.log('� Validating Google OAuth user in App.jsx...');
        
        // Check if this is a complete user profile
        const hasRequiredFields = session.user.email && 
                                 (session.user.user_metadata?.full_name || session.user.user_metadata?.name);
        
        const emailVerified = session.user.email_verified || session.user.user_metadata?.email_verified;
        
        if (!hasRequiredFields || !emailVerified) {
          console.error('❌ Incomplete Google user profile, signing out...');
          console.error('❌ Has required fields:', hasRequiredFields);
          console.error('❌ Email verified:', emailVerified);
          console.error('❌ User metadata:', session.user.user_metadata);
          
          await supabase.auth.signOut();
          showToast.error('Account setup incomplete. Please try signing up first.');
          navigate('/signup', { replace: true });
          return;
        }
        
        console.log('✅ Google user validation passed in App.jsx');
      }
      
      console.log('✅ Current URL before cleanup:', window.location.href);
      console.log('✅ Current pathname:', window.location.pathname);
      console.log('✅ Current search:', window.location.search);
      
      // Store tokens
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
      
      // Clean URL first if it has OAuth params (before navigation)
      if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
        console.log('✅ Cleaning OAuth callback URL...');
        const cleanUrl = window.location.protocol + '//' + window.location.host + '/dashboard';
        console.log('✅ Setting clean URL to:', cleanUrl);
        window.history.replaceState({}, document.title, '/dashboard');
        console.log('✅ URL after cleanup:', window.location.href);
      }
      
      // Update auth state
      await checkAuth();
      
      // Show success and navigate to dashboard
      showToast.success('Signed in successfully!');
      
      // Navigate to dashboard with a small delay to ensure state is updated
      console.log('✅ About to navigate to dashboard...');
      setTimeout(() => {
        console.log('✅ Executing navigation to dashboard...');
        // Try both navigation methods
        navigate('/dashboard', { replace: true });
        // Also force with window.location as backup
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            console.log('✅ Navigate failed, using window.location.href as fallback');
            window.location.href = '/dashboard';
          }
        }, 200);
      }, 100);
      
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

    // Cleanup function
    return () => {
      clearTimeout(fallbackTimeout);
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
        <Route path="auth/callback" element={<AuthCallbackPage />} />
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