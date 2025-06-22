import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      plan: 'free',
      subscriptionStatus: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null,
      isSubscriptionLoading: false,
      usage: {
        scrubsThisMonth: 0,
        customRules: 0,
        lastReset: new Date().toISOString()
      },
      limits: {
        free: {
          scrubsPerMonth: 800,
          customRules: 25,
          patterns: 20,
          history: '24h',
          sites: ['chatgpt', 'claude', 'gemini', 'copilot']
        },
        pro: {
          scrubsPerMonth: -1, // unlimited
          customRules: 100,
          patterns: 100,
          history: '90d',
          sites: 'allowlist'
        },
        enterprise: {
          scrubsPerMonth: -1,
          customRules: -1,
          patterns: -1,
          history: 'custom',
          sites: 'policy'
        }
      },
      
      fetchSubscriptionStatus: async () => {
        set({ isSubscriptionLoading: true });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('No auth token found, using default free plan');
            set({ 
              plan: 'free',
              subscriptionStatus: 'trial',
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              trialEndsAt: null,
              isSubscriptionLoading: false 
            });
            return;
          }

          const response = await fetch('/api/subscription/status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired or invalid, clear auth
              localStorage.removeItem('token');
              set({ 
                plan: 'free',
                subscriptionStatus: 'trial',
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                trialEndsAt: null,
                isSubscriptionLoading: false 
              });
              return;
            }
            throw new Error(`Failed to fetch subscription status: ${response.status}`);
          }

          const data = await response.json();
          
          set({
            plan: data.plan || 'free',
            subscriptionStatus: data.subscription_status || 'trial',
            stripeCustomerId: data.stripe_customer_id || null,
            stripeSubscriptionId: data.stripe_subscription_id || null,
            trialEndsAt: data.trial_ends_at || null,
            isSubscriptionLoading: false
          });

        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
          // On error, fall back to free plan but don't clear existing data
          set({ 
            isSubscriptionLoading: false,
            // Keep existing plan data in case of temporary network issues
          });
        }
      },
      
      updateUsage: (type, amount = 1) => {
        set(state => ({
          usage: {
            ...state.usage,
            [type]: state.usage[type] + amount
          }
        }))
      },
      
      resetMonthlyUsage: () => {
        set(state => ({
          usage: {
            ...state.usage,
            scrubsThisMonth: 0,
            lastReset: new Date().toISOString()
          }
        }))
      },
      
      canPerformAction: (action) => {
        const state = get()
        const currentLimits = state.limits[state.plan]
        
        switch (action) {
          case 'scrub':
            return currentLimits.scrubsPerMonth === -1 || 
                   state.usage.scrubsThisMonth < currentLimits.scrubsPerMonth
          case 'addCustomRule':
            return currentLimits.customRules === -1 || 
                   state.usage.customRules < currentLimits.customRules
          default:
            return true
        }
      },
      
      getUsagePercentage: (type) => {
        const state = get()
        const currentLimits = state.limits[state.plan]
        const usage = state.usage[type]
        const limit = currentLimits[type === 'scrubsThisMonth' ? 'scrubsPerMonth' : type]
        
        if (limit === -1) return 0 // unlimited
        return Math.min((usage / limit) * 100, 100)
      },
      
      upgradePlan: async (newPlan) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/subscription/create-checkout', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plan: newPlan })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upgrade failed');
          }
          
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        plan: state.plan,
        subscriptionStatus: state.subscriptionStatus,
        stripeCustomerId: state.stripeCustomerId,
        stripeSubscriptionId: state.stripeSubscriptionId,
        trialEndsAt: state.trialEndsAt,
        usage: state.usage
      })
    }
  )
)

export { useSubscriptionStore }