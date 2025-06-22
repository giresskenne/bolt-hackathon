import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import extensionApi from '../utils/extensionApi'

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      plan: 'free',
      subscriptionStatus: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null,
      isSubscriptionLoading: false,
      
      // Extension-managed data
      extensionUsage: {
        scrubsThisMonth: 0,
        customRules: 0,
        lastReset: new Date().toISOString()
      },
      customRules: [],
      scrubHistory: [],
      isExtensionDataLoading: false,
      extensionConnected: false,
      
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

          // Also fetch extension data after subscription status is loaded
          const { fetchExtensionData } = get();
          fetchExtensionData();

        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
          // On error, fall back to free plan but don't clear existing data
          set({ 
            isSubscriptionLoading: false,
            // Keep existing plan data in case of temporary network issues
          });
        }
      },

      fetchExtensionData: async () => {
        set({ isExtensionDataLoading: true });
        try {
          if (!extensionApi.isExtensionReady()) {
            console.warn('Extension not ready, skipping data fetch');
            set({ 
              isExtensionDataLoading: false,
              extensionConnected: false 
            });
            return;
          }

          // Fetch all extension data in parallel
          const [usage, customRules, scrubHistory] = await Promise.all([
            extensionApi.getUsage(),
            extensionApi.getCustomRules(),
            extensionApi.getScrubHistory(50)
          ]);

          set({
            extensionUsage: usage,
            customRules,
            scrubHistory,
            isExtensionDataLoading: false,
            extensionConnected: true
          });

          // Update extension plan if it differs from backend
          const { plan } = get();
          if (usage.plan !== plan) {
            await extensionApi.updatePlan(plan);
          }

        } catch (error) {
          console.error('Failed to fetch extension data:', error);
          set({ 
            isExtensionDataLoading: false,
            extensionConnected: false 
          });
        }
      },

      // Extension data management methods
      addCustomRule: async (rule) => {
        try {
          const newRule = await extensionApi.addCustomRule(rule);
          const { customRules } = get();
          set({ customRules: [...customRules, newRule] });
          return { success: true, data: newRule };
        } catch (error) {
          console.error('Failed to add custom rule:', error);
          return { success: false, error: error.message };
        }
      },

      updateCustomRule: async (id, updates) => {
        try {
          const updatedRule = await extensionApi.updateCustomRule(id, updates);
          const { customRules } = get();
          const updatedRules = customRules.map(rule => 
            rule.id === id ? updatedRule : rule
          );
          set({ customRules: updatedRules });
          return { success: true, data: updatedRule };
        } catch (error) {
          console.error('Failed to update custom rule:', error);
          return { success: false, error: error.message };
        }
      },

      deleteCustomRule: async (id) => {
        try {
          await extensionApi.deleteCustomRule(id);
          const { customRules } = get();
          const filteredRules = customRules.filter(rule => rule.id !== id);
          set({ customRules: filteredRules });
          return { success: true };
        } catch (error) {
          console.error('Failed to delete custom rule:', error);
          return { success: false, error: error.message };
        }
      },

      canPerformAction: async (action) => {
        try {
          return await extensionApi.canPerformAction(action);
        } catch (error) {
          console.error('Failed to check action permission:', error);
          // Fallback to local limits check
          const { extensionUsage, limits, plan } = get();
          const currentLimits = limits[plan];
          
          switch (action) {
            case 'scrub':
              return currentLimits.scrubsPerMonth === -1 || 
                     extensionUsage.scrubsThisMonth < currentLimits.scrubsPerMonth;
            case 'addCustomRule':
              return currentLimits.customRules === -1 || 
                     extensionUsage.customRules < currentLimits.customRules;
            default:
              return true;
          }
        }
      },

      getUsagePercentage: async (type) => {
        try {
          return await extensionApi.getUsagePercentage(type);
        } catch (error) {
          console.error('Failed to get usage percentage:', error);
          // Fallback to local calculation
          const { extensionUsage, limits, plan } = get();
          const currentLimits = limits[plan];
          const usage = extensionUsage[type === 'scrubsThisMonth' ? 'scrubsThisMonth' : type];
          const limit = currentLimits[type === 'scrubsThisMonth' ? 'scrubsPerMonth' : type];
          
          if (limit === -1) return 0; // unlimited
          return Math.min((usage / limit) * 100, 100);
        }
      },

      exportExtensionData: async () => {
        try {
          return await extensionApi.exportData();
        } catch (error) {
          console.error('Failed to export extension data:', error);
          throw error;
        }
      },

      clearExtensionData: async () => {
        try {
          await extensionApi.clearAllData();
          set({
            extensionUsage: {
              scrubsThisMonth: 0,
              customRules: 0,
              lastReset: new Date().toISOString()
            },
            customRules: [],
            scrubHistory: []
          });
          return { success: true };
        } catch (error) {
          console.error('Failed to clear extension data:', error);
          return { success: false, error: error.message };
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
        usage: state.usage,
        // Don't persist extension data as it should always be fetched fresh
      })
    }
  )
)

export { useSubscriptionStore }