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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ... existing login, signup, updateUser, updateProfile, deleteAccount

      loginWithGoogle: async (intendedPlan = null) => {
        set({ isLoading: true });
        try {
          // Supabase will redirect to this URL after successful OAuth, with tokens in hash
          const redirectToUrl = `${window.location.origin}/dashboard`;

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectToUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              }
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          // Supabase will handle the redirect, so no further action needed here
          return { success: true };
        } catch (error) {
          console.error('Google login error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signupWithGoogle: async (plan = 'free') => {
        set({ isLoading: true });
        try {
          // Supabase will redirect to this URL after successful OAuth, with tokens in hash
          const redirectToUrl = `${window.location.origin}/dashboard`;

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectToUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              }
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          // Supabase will handle the redirect, so no further action needed here
          return { success: true };
        } catch (error) {
          console.error('Google signup error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      handleAuthRedirect: async () => {
        try {
          // 1️⃣ Only run this on the page that receives ?code=...&state=...
          if (!window.location.search.includes('code=')) {
            return { success: false, message: 'No auth code in URL' };
          }
        
          // 2️⃣ Exchange the code for a real session and store it
          const { data, error } = await supabase.auth.exchangeCodeForSession(); // v2.33+
          // - or -
          // const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        
          if (error) throw error;
        
          // 3️⃣ data.session now contains access_token / refresh_token
          localStorage.setItem('token',        data.session.access_token);
          localStorage.setItem('refresh_token', data.session.refresh_token);
        
          // 4️⃣ Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        
          // 5️⃣ Update your store’s state
          await get().checkAuth();
        
          return { success: true, type: 'login', message: 'Signed in successfully!' };
        } catch (err) {
          console.error('Auth redirect error:', err);
          return { success: false, error: err.message };
        }
      },


      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Use Supabase client to get the current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            throw new Error(sessionError.message);
          }

          if (session) {
            // If session exists, ensure token is in localStorage for backend calls
            localStorage.setItem('token', session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token);

            // Fetch user profile from your backend using the Supabase access token
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              set({ user: data.user, isAuthenticated: true, isLoading: false });
            } else {
              // If backend /me fails (e.g., token invalid or expired), sign out from Supabase
              await supabase.auth.signOut();
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            // No session, ensure local storage is clear
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut(); // Sign out from Supabase
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
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
