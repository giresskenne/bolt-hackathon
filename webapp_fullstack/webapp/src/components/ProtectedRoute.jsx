import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Show loading while auth status is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}