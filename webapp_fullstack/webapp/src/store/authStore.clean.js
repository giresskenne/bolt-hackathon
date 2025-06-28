// webapp_fullstack/webapp/src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@supabase/supabase-js'; // Add this import

// Initialize Supabase client for frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure these environment variables are set in your webapp/.env file
// Example:
// VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
// VITE_SUPABASE_ANON_KEY="your-anon-key"

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables for frontend Supabase client.');
  // You might want to add a more user-friendly error or disable auth features if these are missing.
}

// Configure Supabase client with PKCE flow for better security
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for better security and OAuth handling
  }
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Email/Password Login
      login: async (email, password) => {
        set({ isLoading: true });
        console.log('Starting email/password login for:', email);
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          console.log('Supabase signInWithPassword data:', data);
          console.log('Supabase signInWithPassword error:', error);

          if (error) {
            console.error('Login failed:', error);
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.session) {
            console.log('Login successful, storing tokens and setting user...');
            // Store tokens for backend API calls
            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);

            // Extract user data from session
            const userData = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
              avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
              plan: data.user.user_metadata?.plan || 'free',
              email_verified: data.user.email_verified || data.user.user_metadata?.email_verified,
              provider: data.user.app_metadata?.provider || 'email'
            };

            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return { success: true, user: userData };
          } else {
            console.error('No session returned from Supabase');
            set({ isLoading: false });
            return { success: false, error: 'No session created' };
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Email/Password Signup
      signup: async (email, password, plan = 'free') => {
        set({ isLoading: true });
        console.log('Starting email/password signup for:', email, 'with plan:', plan);
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                plan: plan
              }
            }
          });

          console.log('Supabase signUp data:', data);
          console.log('Supabase signUp error:', error);

          if (error) {
            console.error('Signup failed:', error);
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            console.log('Signup successful...');
            
            // If user is immediately confirmed (no email confirmation required)
            if (data.session) {
              localStorage.setItem('token', data.session.access_token);
              localStorage.setItem('refresh_token', data.session.refresh_token);
              
              const userData = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
                avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                plan: plan,
                email_verified: data.user.email_verified || data.user.user_metadata?.email_verified,
                provider: data.user.app_metadata?.provider || 'email'
              };
              
              set({ 
                user: userData, 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              // Email confirmation required
              set({ isLoading: false });
            }

            return { 
              success: true, 
              user: data.user,
              needsConfirmation: !data.session
            };
          } else {
            console.error('No user returned from Supabase signup');
            set({ isLoading: false });
            return { success: false, error: 'Signup failed - no user created' };
          }
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Update User Profile
      updateUser: async (updates) => {
        set({ isLoading: true });
        console.log('Updating user profile with:', updates);
        try {
          // Update local user state
          set(state => ({
            user: { ...state.user, ...updates },
            isLoading: false
          }));

          return { success: true, user: { ...get().user, ...updates } };
        } catch (error) {
          console.error('Update user error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Delete Account
      deleteAccount: async (password) => {
        set({ isLoading: true });
        console.log('Starting account deletion...');
        try {
          // Clear all auth data
          await supabase.auth.signOut();
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false });

          return { success: true };
        } catch (error) {
          console.error('Delete account error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Google OAuth Login
      loginWithGoogle: async (intendedPlan = null) => {
        console.log('🚀 loginWithGoogle called with plan:', intendedPlan);
        
        try {
          console.log('🔍 Supabase client ready:', !!supabase);
          console.log('📞 Calling supabase.auth.signInWithOAuth...');
          
          // Add redirectTo to ensure we go to dashboard after OAuth
          const result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`
            }
          });

          console.log('✅ OAuth call completed');
          console.log('📊 Result:', result);

          if (result.error) {
            console.error('💥 Google OAuth failed:', result.error);
            return { success: false, error: result.error.message };
          }

          console.log('🎉 OAuth should redirect now...');
          return { success: true };
        } catch (error) {
          console.error('💥 Exception in Google login:', error);
          return { success: false, error: error.message };
        }
      },

      // Google OAuth Signup
      signupWithGoogle: async (plan = 'free') => {
        console.log('🚀 signupWithGoogle called with plan:', plan);
        
        try {
          console.log('🔍 Supabase client ready:', !!supabase);
          console.log('📞 Calling supabase.auth.signInWithOAuth for signup...');
          
          // Add redirectTo to ensure we go to dashboard after OAuth
          const result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`
            }
          });

          console.log('✅ OAuth signup call completed');
          console.log('📊 Result:', result);

          if (result.error) {
            console.error('💥 Google OAuth signup failed:', result.error);
            return { success: false, error: result.error.message };
          }

          console.log('🎉 OAuth signup should redirect now...');
          return { success: true };
        } catch (error) {
          console.error('💥 Exception in Google signup:', error);
          return { success: false, error: error.message };
        }
      },

      // Check Authentication Status
      checkAuth: async () => {
        set({ isLoading: true });
        console.log('🟡 Starting auth check...');
        try {
          // Use Supabase client to get the current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          console.log('🟡 Supabase getSession session:', session);
          console.log('🟡 Supabase getSession error:', sessionError);

          if (sessionError) {
            console.error('Session error from Supabase:', sessionError);
            throw new Error(sessionError.message);
          }

          if (session) {
            console.log('🟡 Valid session found, storing tokens and setting user...');
            // If session exists, store token and set user data
            localStorage.setItem('token', session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token);

            // Extract user data from session
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              plan: session.user.user_metadata?.plan || 'free',
              email_verified: session.user.email_verified || session.user.user_metadata?.email_verified,
              provider: session.user.app_metadata?.provider || 'email'
            };

            console.log('🟡 Setting user data:', userData);
            set({ user: userData, isAuthenticated: true, isLoading: false });
            console.log('🟡 Auth state after setting:', { user: userData, isAuthenticated: true });
            console.log('🟡 Auth check successful - user authenticated');
          } else {
            console.log('🟡 No session found, clearing auth state...');
            // No session, ensure local storage is clear
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('🟡 Check auth error:', error);
          console.error('🟡 Auth check failed, clearing all auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        console.log('Starting logout...');
        await supabase.auth.signOut(); // Sign out from Supabase
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
        console.log('Logout complete');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { useAuthStore };
