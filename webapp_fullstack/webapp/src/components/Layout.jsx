import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, ChevronDown, Settings, CreditCard } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Logo from '/extension/icons/Logo.png'

export default function Layout() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Try Demo', href: '/demo' },
  ]

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Settings', href: '/account/settings', icon: Settings },
    { name: 'Billing', href: '/account/billing', icon: CreditCard },
  ]

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userDropdownOpen])

  return (
    <div className="min-h-screen bg-discord-hero">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={Logo} alt="Privly Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Privly</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={
                    item.name === 'Try Demo'
                      ? 'bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors'
                      : `transition-colors ${
                          location.pathname === item.href
                            ? 'text-primary-light font-semibold'
                            : 'text-white hover:text-primary-light'
                        }`
                  }
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    onMouseEnter={() => setUserDropdownOpen(true)}
                    className="flex items-center space-x-2 text-white hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        {userNavigation.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                location.pathname === item.href
                                  ? 'text-primary-light bg-primary/10'
                                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                      
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={() => {
                            logout()
                            setUserDropdownOpen(false)
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-lg border-t border-white/10">
            <div className="px-6 py-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={
                    item.name === 'Try Demo'
                      ? 'block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors text-center'
                      : 'block text-white hover:text-primary-light transition-colors'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex items-center space-x-3 px-4 py-2 text-white">
                      <User className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-2 transition-colors ${
                        location.pathname === item.href
                          ? 'text-primary-light bg-primary/10 rounded-lg'
                          : 'text-white hover:text-primary-light'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-white hover:text-red-400 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-white hover:text-primary-light transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-white transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  )
}