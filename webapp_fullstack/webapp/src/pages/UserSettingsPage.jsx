import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Save,
  Trash2,
  Download,
  Upload,
  Settings,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserSettingsPage() {
  const navigate = useNavigate()
  const { user, updateProfile, deleteAccount } = useAuthStore()
  const { plan } = useSubscriptionStore()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    securityAlerts: true,
    productUpdates: false,
    darkMode: false,
    autoScrub: true,
    showTooltips: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'data', name: 'Data & Privacy', icon: Lock }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate password change if attempted
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error('New passwords do not match')
          setIsLoading(false)
          return
        }
        if (profileData.newPassword.length < 8) {
          toast.error('Password must be at least 8 characters')
          setIsLoading(false)
          return
        }
        if (!profileData.currentPassword) {
          toast.error('Current password is required to change password')
          setIsLoading(false)
          return
        }
      }

      // Call the backend API
      const result = await updateProfile({
        currentPassword: profileData.currentPassword || undefined,
        newPassword: profileData.newPassword || undefined,
        email: profileData.email !== user?.email ? profileData.email : undefined
      });
      
      if (result.success) {
        toast.success(result.message || 'Profile updated successfully')
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setIsLoading(true)
    try {
      // Save preferences to localStorage (in real app, would sync to backend)
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      toast.success('Preferences saved successfully')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    // Export user data as JSON
    const userData = {
      profile: { email: user?.email },
      preferences,
      customRules: JSON.parse(localStorage.getItem('customRules') || '[]'),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-scrubber-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    const password = prompt('Enter your password to confirm account deletion:')
    if (!password) {
      toast.error('Account deletion cancelled')
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteAccount(password)
      
      if (result.success) {
        toast.success(result.message || 'Account deleted successfully')
        // Redirect to home page after successful deletion
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email changes require verification</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                {profileData.newPassword && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Confirm new password"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Two-Factor Authentication <span className="text-sm text-yellow-400 font-normal">(Coming soon)</span></h4>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Active Sessions</h4>
                      <p className="text-sm text-gray-400">Manage your active login sessions</p>
                    </div>
                    <button className="text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-semibold transition-colors">
                      View Sessions
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">API Keys</h4>
                      <p className="text-sm text-gray-400">Manage API keys for integrations</p>
                    </div>
                    <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                  { key: 'securityAlerts', label: 'Security Alerts', description: 'Get notified about security events' },
                  { key: 'productUpdates', label: 'Product Updates', description: 'Stay informed about new features' }
                ].map((setting) => (
                  <div key={setting.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{setting.label}</h4>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[setting.key]}
                          onChange={(e) => setPreferences(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handlePreferencesUpdate}
                disabled={isLoading}
                className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )

      case 'preferences':
        return (
            <div>
                      <h4 className="font-semibold">Coming soon</h4>
                      <p className="text-sm text-gray-400">Use dark theme for the interface</p>
                      <p className="text-sm text-gray-400">Automatically scrub detected sensitive data</p>
                      <p className="text-sm text-gray-400">Display helpful tooltips and hints</p>
                    </div>
        )
    //       <div className="space-y-6">
    //         <div>
    //           <h3 className="text-lg font-semibold mb-4">Application Preferences</h3>
    //           <div className="space-y-4">
    //             {[
    //               { key: 'darkMode', label: 'Dark Mode', description: 'Use dark theme for the interface' },
    //               { key: 'autoScrub', label: 'Auto-Scrub', description: 'Automatically scrub detected sensitive data' },
    //               { key: 'showTooltips', label: 'Show Tooltips', description: 'Display helpful tooltips and hints' }
    //             ].map((setting) => (
    //               <div key={setting.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
    //                 <div className="flex items-center justify-between">
    //                   <div>
    //                     <h4 className="font-semibold">{setting.label}</h4>
    //                     <p className="text-sm text-gray-400">{setting.description}</p>
    //                   </div>
    //                   <label className="relative inline-flex items-center cursor-pointer">
    //                     <input
    //                       type="checkbox"
    //                       checked={preferences[setting.key]}
    //                       onChange={(e) => setPreferences(prev => ({ ...prev, [setting.key]: e.target.checked }))}
    //                       className="sr-only peer"
    //                     />
    //                     <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    //                   </label>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //           <button
    //             onClick={handlePreferencesUpdate}
    //             disabled={isLoading}
    //             className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    //           >
    //             <Save className="w-4 h-4" />
    //             <span>Save Preferences</span>
    //           </button>
    //         </div>
    //       </div>
    //     )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Export Data</h4>
                      <p className="text-sm text-gray-400">Download a copy of your data</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Clear Local Data</h4>
                      <p className="text-sm text-gray-400">Remove all locally stored data</p>
                    </div>
                    <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                      Clear Data
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-400">Delete Account</h4>
                      <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-300">Manage your account preferences and security settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}