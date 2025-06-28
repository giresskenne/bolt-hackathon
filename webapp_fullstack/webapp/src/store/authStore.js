import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          console.log('Attempting login to:', '/api/auth/signin');
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          
          console.log('Signin response status:', response.status);
          const responseText = await response.text();
          console.log('Signin response text:', responseText);
          
          if (!response.ok) {
            let errorMessage = 'Signin failed';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // Response wasn't JSON, use status text
              errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }
          
          const data = JSON.parse(responseText);
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Store token in localStorage
          if (data.session?.access_token) {
            localStorage.setItem('token', data.session.access_token);
          }
          
          return { success: true }
        } catch (error) {
          console.error('Signin error:', error);
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      signup: async (email, password, plan = 'free') => {
        set({ isLoading: true })
        try {
          console.log('Attempting signup to:', '/api/auth/signup');
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, plan })
          })
          
          console.log('Signup response status:', response.status);
          const responseText = await response.text();
          console.log('Signup response text:', responseText);
          
          if (!response.ok) {
            let errorMessage = 'Signup failed';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // Response wasn't JSON, use status text
              errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }
          
          const data = JSON.parse(responseText);
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Store token in localStorage
          if (data.session?.access_token) {
            localStorage.setItem('token', data.session.access_token);
          }
          
          return { success: true }
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      loginWithGoogle: async (intendedPlan = null) => {
        set({ isLoading: true })
        try {
          // For Google OAuth, we need to redirect to the backend OAuth endpoint
          const redirectUrl = `${window.location.origin}/dashboard`
          let googleAuthUrl = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`
          
          // Add intended plan if user was trying to upgrade
          if (intendedPlan) {
            googleAuthUrl += `&plan=${intendedPlan}`
          }
          
          // Redirect to Google OAuth
          window.location.href = googleAuthUrl
          
          return { success: true }
        } catch (error) {
          console.error('Google login error:', error)
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      signupWithGoogle: async (plan = 'free') => {
        set({ isLoading: true })
        try {
          // For Google OAuth, we need to redirect to the backend OAuth endpoint
          // The backend will handle the Google OAuth flow and redirect back to the frontend
          const redirectUrl = `${window.location.origin}/dashboard`
          const googleAuthUrl = `/api/auth/google?plan=${plan}&redirect=${encodeURIComponent(redirectUrl)}`
          
          // Redirect to Google OAuth
          window.location.href = googleAuthUrl
          
          return { success: true }
        } catch (error) {
          console.error('Google signup error:', error)
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      handleAuthRedirect: async () => {
        try {
          // Parse URL hash for Supabase auth tokens
          const hash = window.location.hash;
          if (!hash) return { success: false, message: 'No hash found' };
          
          // Extract tokens from hash
          const params = new URLSearchParams(hash.substring(1)); // Remove # from hash
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const tokenType = params.get('token_type');
          const type = params.get('type');
          
          if (!accessToken) {
            return { success: false, message: 'No access token found' };
          }
          
          console.log('Processing auth redirect:', { type, tokenType });
          
          // Store the access token
          localStorage.setItem('token', accessToken);
          
          // Store refresh token if available
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          
          // Clear the URL hash to remove tokens from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Validate the token and fetch user data
          await get().checkAuth();
          
          return { 
            success: true, 
            type,
            message: type === 'signup' ? 'Email confirmed successfully!' : 'Signed in successfully!'
          };
        } catch (error) {
          console.error('Auth redirect error:', error);
          return { success: false, error: error.message };
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false })
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }))
      },
      
      updateProfile: async (profileData) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
          }

          const data = await response.json();
          
          // Update user in store
          set(state => ({
            user: { ...state.user, ...data.user }
          }));

          return { success: true, message: data.message };
        } catch (error) {
          console.error('Update profile error:', error);
          return { success: false, error: error.message };
        }
      },

      deleteAccount: async (password) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/auth/me/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete account');
          }

          const data = await response.json();
          
          // Clear auth state
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });

          return { success: true, message: data.message };
        } catch (error) {
          console.error('Delete account error:', error);
          return { success: false, error: error.message };
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user, isAuthenticated: true, isLoading: false })
          } else {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

export { useAuthStore }