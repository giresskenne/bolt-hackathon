import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      plan: 'free',
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
          const response = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: newPlan })
          })
          
          if (!response.ok) {
            throw new Error('Upgrade failed')
          }
          
          const data = await response.json()
          set({ plan: newPlan })
          
          return { success: true, data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      }
    }),
    {
      name: 'subscription-storage'
    }
  )
)

export { useSubscriptionStore }