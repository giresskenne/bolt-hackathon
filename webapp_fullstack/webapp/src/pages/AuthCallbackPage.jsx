import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../store/authStore';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../utils/toastUtils';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🟦 Auth callback page loaded');
      console.log('🟦 Search params:', window.location.search);
      console.log('🟦 Hash params:', window.location.hash);
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('🔴 OAuth error:', error, errorDescription);
        showToast.error(errorDescription || 'Authentication failed');
        navigate('/login', { replace: true });
        return;
      }

      if (code) {
        console.log('🟦 Found auth code, exchanging for session...');
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('🔴 Code exchange failed:', exchangeError);
            showToast.error('Authentication failed: ' + exchangeError.message);
            navigate('/login', { replace: true });
            return;
          }

          if (data.session) {
            console.log('🟢 Code exchange successful!');
            console.log('🟢 Session:', data.session);
            console.log('🟢 User:', data.user);
            
            // Store tokens
            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);
            
            // Validate the user before proceeding
            if (data.user.app_metadata?.provider === 'google') {
              console.log('🟦 Validating Google OAuth user...');
              
              const hasRequiredFields = data.user.email && 
                                       (data.user.user_metadata?.full_name || data.user.user_metadata?.name);
              
              const emailVerified = data.user.email_verified || data.user.user_metadata?.email_verified;
              
              if (!hasRequiredFields || !emailVerified) {
                console.error('🔴 Incomplete Google user profile');
                console.error('🔴 Has required fields:', hasRequiredFields);
                console.error('🔴 Email verified:', emailVerified);
                console.error('🔴 User metadata:', data.user.user_metadata);
                
                await supabase.auth.signOut();
                showToast.error('Account setup incomplete. Please try signing up first.');
                navigate('/signup', { replace: true });
                return;
              }
              
              console.log('🟢 Google user validation passed');
            }
            
            // Update auth state
            await checkAuth();
            
            showToast.success('Successfully signed in!');
            navigate('/dashboard', { replace: true });
          } else {
            console.error('🔴 No session after code exchange');
            showToast.error('Authentication failed');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('🔴 Code exchange error:', error);
          showToast.error('Authentication failed: ' + error.message);
          navigate('/login', { replace: true });
        }
      } else {
        console.error('🔴 No auth code found in callback');
        showToast.error('Authentication failed - no authorization code');
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
        <p className="text-gray-400">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
