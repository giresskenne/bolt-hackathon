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
      
      logout: () => {
        localStorage.removeItem('token');
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