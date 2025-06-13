import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Logo from '/extension/icons/Logo.png'

export default function Layout() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/docs' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Try Demo', href: '/demo' },
  ]

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Billing', href: '/account/billing' },
  ]

  return (
    <div className="min-h-screen bg-discord-hero">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={Logo} alt="Prompt-Scrubber Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Prompt-Scrubber</span>
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
                <div className="flex items-center space-x-4">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`transition-colors ${
                        location.pathname === item.href
                          ? 'text-primary-light font-semibold'
                          : 'text-white hover:text-primary-light'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex items-center space-x-2 text-white">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-white hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
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
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block text-white hover:text-primary-light transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block text-white hover:text-red-400 transition-colors"
                  >
                    Logout
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