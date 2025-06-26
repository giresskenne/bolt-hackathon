import toast from 'react-hot-toast'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import React from 'react'

/**
 * Enhanced toast utilities with better visibility and user engagement
 */

// Custom toast component for better control
const CustomToast = ({ type, title, message, onDismiss, persistent = false }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getStyles = () => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-xl border-2 shadow-lg min-w-[320px] max-w-[500px]"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  return (
    <div className={getStyles()}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {(persistent || type === 'error') && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Enhanced toast functions
export const showToast = {
  success: (message, options = {}) => {
    const { title, persistent = false, ...toastOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          type="success"
          title={title}
          message={message}
          persistent={persistent}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: persistent ? Infinity : 5000,
        ...toastOptions
      }
    )
  },

  error: (message, options = {}) => {
    const { title, persistent = true, ...toastOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          type="error"
          title={title || 'Error'}
          message={message}
          persistent={persistent}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: persistent ? Infinity : 8000,
        ...toastOptions
      }
    )
  },

  warning: (message, options = {}) => {
    const { title, persistent = false, ...toastOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          type="warning"
          title={title || 'Warning'}
          message={message}
          persistent={persistent}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: persistent ? Infinity : 7000,
        ...toastOptions
      }
    )
  },

  info: (message, options = {}) => {
    const { title, persistent = false, ...toastOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          type="info"
          title={title}
          message={message}
          persistent={persistent}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: persistent ? Infinity : 6000,
        ...toastOptions
      }
    )
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      style: {
        background: '#EFF6FF',
        color: '#1D4ED8',
        border: '2px solid #3B82F6',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        minWidth: '320px'
      },
      ...options
    })
  },

  // Special method for critical alerts that require acknowledgment
  critical: (message, options = {}) => {
    const { title = 'Important', onAcknowledge, ...toastOptions } = options
    
    return toast.custom(
      (t) => (
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 shadow-2xl min-w-[400px] max-w-[600px]">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-800 font-bold text-base mb-2">{title}</h4>
              <p className="text-red-700 text-sm leading-relaxed mb-4">{message}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    onAcknowledge?.()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        ...toastOptions
      }
    )
  },

  // Promise-based toast for async operations
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: (data) => messages.success || 'Success!',
        error: (err) => messages.error || 'Something went wrong'
      },
      {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '2px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          minWidth: '320px'
        },
        success: {
          duration: 5000,
          style: {
            background: '#F0FDF4',
            border: '2px solid #22C55E',
            color: '#166534'
          }
        },
        error: {
          duration: 8000,
          style: {
            background: '#FEF2F2',
            border: '2px solid #EF4444',
            color: '#DC2626'
          }
        },
        ...options
      }
    )
  }
}

// Utility to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss()
}

// Utility to check if any toasts are currently visible
export const hasActiveToasts = () => {
  return toast.getToasts().length > 0
}

export default showToast