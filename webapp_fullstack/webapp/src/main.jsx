import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 6000,
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
            minWidth: '320px',
            maxWidth: '500px'
          },
          success: {
            duration: 5000,
            style: {
              background: '#F0FDF4',
              color: '#166534',
              border: '2px solid #22C55E',
              boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)'
            },
            iconTheme: {
              primary: '#22C55E',
              secondary: '#F0FDF4'
            }
          },
          error: {
            duration: 8000,
            style: {
              background: '#FEF2F2',
              color: '#DC2626',
              border: '2px solid #EF4444',
              boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)'
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2'
            }
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#EFF6FF',
              color: '#1D4ED8',
              border: '2px solid #3B82F6',
              boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)'
            },
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#EFF6FF'
            }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)