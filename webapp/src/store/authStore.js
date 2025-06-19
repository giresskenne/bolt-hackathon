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
          console.log('Attempting login to:', '/api/auth/login');
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          
          console.log('Login response status:', response.status);
          const responseText = await response.text();
          console.log('Login response text:', responseText);
          
          if (!response.ok) {
            let errorMessage = 'Login failed';
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
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          
          return { success: true }
        } catch (error) {
          console.error('Login error:', error);
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
          if (data.token) {
            localStorage.setItem('token', data.token);
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
      
      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false })
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